`import Ember from 'ember'`
`import GCSUploader from 'irene/uploaders/gcs-uploader'`
`import ENV from 'irene/config/environment';`

GCSUploadComponent = Ember.FileField.extend

  store: null

  filesDidChange: ( ->
    signingUrl = [ENV.APP.API_BASE, ENV.endpoints.signedUrl].join '/'
    files = @get 'files'
    uploader = GCSUploader.create
      url: signingUrl

    uploader.didUpload = (file_key, file_key_signed) ->
      uploadedUrl = [ENV.APP.API_BASE, ENV.endpoints.uploadedFile].join '/'
      data =
        file_key: file_key
        file_key_signed: file_key_signed
      Ember.$.post uploadedUrl, data

    uploader.on 'progress', (e) ->
      # Use `e.percent` to get percentage
      debugger

    if !Ember.isEmpty files
      uploader.upload files[0]
  ).observes 'files'

`export default GCSUploadComponent`
