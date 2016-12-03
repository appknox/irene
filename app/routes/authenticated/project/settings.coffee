`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedProjectSettingsRoute = Ember.Route.extend
  
  title: "Project Setting"  + config.Platform
  model: ->
    @modelFor("authenticated.project")

`export default AuthenticatedProjectSettingsRoute`
