`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedProjectSettingsRoute = Ember.Route.extend
  title: "Project Setting"  + config.platform
  model: ->
    @modelFor("authenticated.project")

  activate: ->
    window.scrollTo(0,0)

`export default AuthenticatedProjectSettingsRoute`
