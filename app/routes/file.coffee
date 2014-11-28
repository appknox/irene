`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

FileRoute = Ember.Route.extend AuthenticatedRouteMixin,

  model: (params)->
    store = @store
    file = store.find 'file', params.file_id
    file.then (file)->
      analyses = store.all 'analysis', file: file.get "id"
      if Ember.isEmpty analyses
        file.get 'analyses'
    file

`export default FileRoute`
