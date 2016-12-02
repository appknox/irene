`import Ember from 'ember'`

AuthenticatedSettingsRoute = Ember.Route.extend

  titleToken: "Settings"
  model: ->
    @modelFor("authenticated")

`export default AuthenticatedSettingsRoute`
