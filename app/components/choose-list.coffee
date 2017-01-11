`import Ember from 'ember'`
`import FileListComponent from 'irene/components/file-list'`

ChooseListComponent = FileListComponent.extend

  fileOld: null

  hasObjects: Ember.computed.gt 'objectCount', 1

  otherFilesInTheProject: Ember.computed.filter 'sortedObjects', (file) ->
    file_id = @get "fileOld.id"
    file_id isnt file.get "id"

`export default ChooseListComponent`
