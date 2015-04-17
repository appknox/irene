`import Ember from 'ember'`
`import GCSUploader from 'irene/uploaders/gcs-uploader'`
`import ENV from 'irene/config/environment';`

GCSUploadComponent = EmberUploader.FileField.extend

  delegate: null

  filesDidChange: ( ->
    self = @
    delegate = @get "delegate"
    delegate.set "isUploading", true
    files = @get 'files'
    signingUrl = [ENV.APP.API_BASE, ENV.endpoints.signedUrl].join '/'
    uploader = GCSUploader.create
      url: signingUrl

    uploader.didUpload = (file_key, file_key_signed) ->
      delegate.set "isUploading", false
      uploadedUrl = [ENV.APP.API_BASE, ENV.endpoints.uploadedFile].join '/'
      data =
        file_key: file_key
        file_key_signed: file_key_signed
      Ember.$.post uploadedUrl, data

    uploader.on 'progress', (e) ->
      # Use `e.percent` to get percentage
      delegate.set "percent", e.percent

    if !Ember.isEmpty files
      uploader.upload files[0]
  ).observes 'files'

`export default GCSUploadComponent`
