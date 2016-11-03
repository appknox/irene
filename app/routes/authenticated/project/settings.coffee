`import Ember from 'ember'`

AuthenticatedProjectSettingsRoute = Ember.Route.extend
  model: ->
    @modelFor("authenticated.project").get('collaborations')

`export default AuthenticatedProjectSettingsRoute`
