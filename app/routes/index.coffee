`import Ember from 'ember';`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

IndexRoute = Ember.Route.extend AuthenticatedRouteMixin,

  setupController: (controller) ->
    controller.set 'model', @store.all 'project'

`export default IndexRoute;`
