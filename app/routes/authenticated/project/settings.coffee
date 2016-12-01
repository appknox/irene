`import Ember from 'ember'`

AuthenticatedProjectSettingsRoute = Ember.Route.extend

  titleToken: "Project Setting"
  model: ->
    @modelFor("authenticated.project")

`export default AuthenticatedProjectSettingsRoute`
