`import Ember from 'ember'`

fileExtension = (params) ->
  filename = params[0]
  if !filename
    return null

  file_parts = filename.split('.')
  if file_parts.length <= 1
    return 'unk'
  file_parts.pop()

FileExtensionHelper = Ember.Helper.helper fileExtension

`export { fileExtension }`

`export default FileExtensionHelper`
