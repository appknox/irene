`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`
`import EmberUploader from 'ember-uploader';`


Uploader = EmberUploader.Uploader.extend

  ajax: null
  notify: null

  upload: (file) ->
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
        debugger
        that.didUpload json.file_key, json.file_key_signed
        that.get("notify").success "File Uploaded Successfully. Please wait while we process your file."
      .catch ->
        debugger
        that.get("notify").error "Error while uploading file to presigned URL"

    data =
      content_type: "application/octet-stream"

    that.get("ajax").request ENV.endpoints.signedUrl, data: data
    .then (json)->
      signSuccess json
    .catch ->
      debugger
      that.get("notify").error "Error while fetching signed url"


`export default Uploader;`

