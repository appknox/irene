`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import EmberUploader from 'ember-uploader'`
`import { translationMacro as t } from 'ember-i18n'`

{inject: {service}, isEmpty, RSVP} = Ember


Uploader = EmberUploader.Uploader.extend

  ajax: service "ajax"
  notify: service "notification-messages"
  i18n: service "i18n"

  tErrorWhileFetching: t("errorWhileFetching")
  tErrorWhileUploading: t("errorWhileUploading")
  tFileUploadedSuccessfully: t("fileUploadedSuccessfully")

  upload: (file, delegate) ->

    tErrorWhileFetching = @get "tErrorWhileFetching"
    tErrorWhileUploading = @get "tErrorWhileUploading"
    tFileUploadedSuccessfully = @get "tFileUploadedSuccessfully"

    that = @

    signSuccess = (json)->
      settings =
        dataType: "text"
        contentType: "application/octet-stream"
        processData: false
        xhrFields:
          withCredentials: false
        xhr: ->
          xhr = Ember.$.ajaxSettings.xhr()
          xhr.upload.onprogress = (e) ->
            that.didProgress e
          that.one 'isAborting', -> xhr.abort()
          xhr
        data: file
      that.get("ajax").put json.url, settings
      .then ->
        that.didUpload json.file_key, json.file_key_signed
        that.get("notify").success tFileUploadedSuccessfully
      .catch (error) ->
        delegate.set "isUploading", false
        that.get("notify").error tErrorWhileUploading
        for error in error.errors
          that.get("notify").error error.detail?.message

    data =
      content_type: "application/octet-stream"

    that.get("ajax").request ENV.endpoints.signedUrl, data: data
    .then (json)->
      $('input[type=file]').val('')
      signSuccess json
    .catch (error) ->
      delegate.set "isUploading", false
      $('input[type=file]').val('')
      that.get("notify").error tErrorWhileFetching
      for error in error.errors
        that.get("notify").error error.detail?.message

`export default Uploader;`
