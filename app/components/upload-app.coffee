`import Ember from 'ember'`
`import Uploader from 'irene/utils/uploader'`
`import ENV from 'irene/config/environment'`

UploadAppComponent = EmberUploader.FileField.extend

  delegate: null
  classNames: ["file-input"]

  filesDidChange: (files) ->

    that = @
    delegate = @get "delegate"
    delegate.set "isUploading", true
    if Ember.isEmpty files
      return
    uploader = Uploader.create container: @container

    uploader.didUpload = (file_key, file_key_signed) ->
      delegate.set "isUploading", false
      data =
        file_key: file_key
        file_key_signed: file_key_signed
      that.get("ajax").post ENV.endpoints.uploadedFile, data: data

    uploader.on 'progress', (e) ->
      delegate.set "progress", parseInt e.percent

    uploader.upload files[0]
    .catch ->
      $('input[type=file]').val('')
      delegate.set "isUploading", false


`export default UploadAppComponent`
