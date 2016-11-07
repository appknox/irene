`import Ember from 'ember'`

AuthenticatedProjectSettingsRoute = Ember.Route.extend
  model: ->
    @modelFor("authenticated.project")

`export default AuthenticatedProjectSettingsRoute`
