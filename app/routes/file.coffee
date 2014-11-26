`import Ember from 'ember'`

FileRoute = Ember.Route.extend

  model: (params)->
    @store.find 'file', params.file_id

`export default FileRoute`
