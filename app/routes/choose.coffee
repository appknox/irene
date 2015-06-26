`import Ember from 'ember'`

ChooseRoute = Ember.Route.extend AuthenticatedRouteMixin,

  model: (params)->
    @store.find 'file', params.fileId

  afterModel: (file, transition) ->
    file.get("project").reload()

`export default ChooseRoute`
