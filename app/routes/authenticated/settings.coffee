`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedSettingsRoute = Ember.Route.extend

  title: "Settings"  + config.platform
  model: ->
    @modelFor("authenticated")
  activate: ->
    window.scrollTo(0,0)    

`export default AuthenticatedSettingsRoute`
