`import Ember from 'ember';`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`
`import Ratio from 'irene/models/ratio';`

IndexRoute = Ember.Route.extend AuthenticatedRouteMixin,

  setupController: (controller)->
    if controller.get 'ratio'
      # Return if the ratio is already assigned.
      return
    ratio = @store.push 'ratio',
      id: 1
      affected: 0
      unaffected: 1
    controller.set "ratio", ratio

`export default IndexRoute;`
