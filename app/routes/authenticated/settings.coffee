`import Ember from 'ember'`

AuthenticatedSettingsRoute = Ember.Route.extend

  model: ->
    @modelFor("authenticated")

`export default AuthenticatedSettingsRoute`
