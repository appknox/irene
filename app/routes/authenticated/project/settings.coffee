`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedProjectSettingsRoute = Ember.Route.extend ScrollTopMixin,
  title: "Project Setting | Appknox"
  model: ->
    @modelFor("authenticated.project")


`export default AuthenticatedProjectSettingsRoute`
