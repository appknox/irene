`import Ember from 'ember'`
`import GCSUploader from '../uploaders/gcs-uploader'`

GCSUploadComponent = Ember.FileField.extend

  store: null

  filesDidChange: ( ->
    applicationAdapter = @store.adapterFor 'application'
    host = applicationAdapter.get 'host'
    namespace = applicationAdapter.get 'namespace'
    signingUrl = [host, namespace, 'signed_url'].join '/'
    files = @get 'files'
    uploader = GCSUploader.create
      url: signingUrl

    uploader.didUpload = (file_key, file_key_signed) ->
      uploadedUrl = [host, namespace, 'uploaded_file'].join '/'
      data =
        file_key: file_key
        file_key_signed: file_key_signed
      Ember.$.post uploadedUrl, data

    if !Ember.isEmpty files
      uploader.upload files[0]
  ).observes 'files'

`export default GCSUploadComponent`
