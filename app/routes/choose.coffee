`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

ChooseRoute = Ember.Route.extend AuthenticatedRouteMixin,

  model: (params)->
    @store.find 'file', params.fileId

  afterModel: (file, transition) ->
    file.get("project").reload()

`export default ChooseRoute`
