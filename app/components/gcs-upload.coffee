`import Ember from 'ember'`
`import GCSUploader from '../uploaders/gcs-uploader'`

GCSUploadComponent = Ember.FileField.extend

  store: null

  filesDidChange: ( ->
    applicationAdapter = @store.adapterFor 'application'
    host = applicationAdapter.get 'host'
    namespace = applicationAdapter.get 'namespace'
    uploadUrl = [host, namespace, 'signed_url'].join '/'
    files = @get 'files'
    uploader = GCSUploader.create
      url: uploadUrl

    uploader.on 'didUpload', (response) ->
      # S3 will return XML with url
      uploadedUrl = $(response).find('Location')[0].textContent
      uploadedUrl = decodeURIComponent uploadedUrl

    if !Ember.isEmpty files
      uploader.upload files[0]
  ).observes 'files'

`export default GCSUploadComponent`
