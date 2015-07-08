`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

CompareRoute = Ember.Route.extend AuthenticatedRouteMixin,

  params: null

  setupController: (controller, model) ->
    params = @get "params"
    store = controller.store
    store.find("file", params.fileId1).then (file) ->
      controller.set "file1", file
    store.find("file", params.fileId2).then (file) ->
      controller.set "file2", file

  model: (params, transition) ->
    @set "params", params
    null

`export default CompareRoute`
