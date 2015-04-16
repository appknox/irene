`import Ember from 'ember'`
`import GCSUploader from 'irene/uploaders/gcs-uploader'`
`import ENV from 'irene/config/environment';`

GCSUploadComponent = EmberUploader.FileField.extend

  store: null

  attributeBindings: ['disabled']

  isUploading: false

  percent: 0

  disabled: (->
    @get "isUploading"
  ).property "isUploading"

  displayText: (->
    if @get "isUploading"
      "Uploading #{parseInt @get "percent"}% ..."
    else
      "Upload App"
  ).property "isUploading", "percent"

  filesDidChange: ( ->
    self = @
    @set "isUploading", true
    signingUrl = [ENV.APP.API_BASE, ENV.endpoints.signedUrl].join '/'
    files = @get 'files'
    uploader = GCSUploader.create
      url: signingUrl

    uploader.didUpload = (file_key, file_key_signed) ->
      self.set "isUploading", false
      uploadedUrl = [ENV.APP.API_BASE, ENV.endpoints.uploadedFile].join '/'
      data =
        file_key: file_key
        file_key_signed: file_key_signed
      Ember.$.post uploadedUrl, data

    uploader.on 'progress', (e) ->
      # Use `e.percent` to get percentage
      self.set "percent", e.percent

    if !Ember.isEmpty files
      uploader.upload files[0]
  ).observes 'files'

`export default GCSUploadComponent`
