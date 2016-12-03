`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedSettingsRoute = Ember.Route.extend

  title: "Settings"  + config.platform
  model: ->
    @modelFor("authenticated")

`export default AuthenticatedSettingsRoute`
