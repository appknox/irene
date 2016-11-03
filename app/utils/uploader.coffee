`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`
`import EmberUploader from 'ember-uploader';`


Uploader = EmberUploader.Uploader.extend

  ajax: null
  notify: null

  sign: (file) ->
    data =
      content_type: "application/octet-stream"
    that = @
    new Ember.RSVP.Promise (resolve, reject) ->
      that.get("ajax").request ENV.endpoints.signedUrl, data: data
      .then (json)->
        resolve json
      .catch ->
        debugger
        that.get("notify").error "Server failed to return Signed URL"
        reject()

  upload: (file) ->
    that = @

    signSuccess = (json)->

      uploadSuccess = (respData) ->
        that.get("notify").success "File Uploaded Successfully. Please wait while we process your file."
        that.didUpload json.file_key, json.file_key_signed

      uploadError = (xhr) ->
        if xhr.status is 200
          that.get("notify").success "File Uploaded Successfully. Please wait while we process your file."
          that.didUpload json.file_key, json.file_key_signed
        else
          that.get("notify").error "Error While signing the file."

      settings =
        url: json.url
        method: "PUT"
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
        success: uploadSuccess
        error: uploadError
      Ember.$.ajax settings

    signError = (e)->
      debugger
      that.get("notify").error "Error While signing the file."

    @sign(file).then signSuccess, signError

`export default Uploader;`

