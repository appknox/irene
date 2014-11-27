`import Ember from 'ember'`

FileRoute = Ember.Route.extend

  model: (params)->
    store = @store
    if Ember.isEmpty store.all 'vulnerability'
      store.findAll 'vulnerability'
    file = store.find 'file', params.file_id
    file.then (file)->
      analyses = store.all 'analysis', file: file.get "id"
      if Ember.isEmpty analyses
        file.get 'analyses'
    file

`export default FileRoute`
