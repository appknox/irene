`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedSettingsRoute = Ember.Route.extend

  title: "Settings"  + config.Platform
  model: ->
    @modelFor("authenticated")

`export default AuthenticatedSettingsRoute`
