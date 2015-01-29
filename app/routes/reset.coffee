`import Ember from 'ember'`

ResetRoute = Ember.Route.extend

  setupController: (foo, params)->
    @controller.set "uuid", params.uuid
    @controller.set "token", params.token

`export default ResetRoute`
