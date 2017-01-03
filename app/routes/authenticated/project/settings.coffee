`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedProjectSettingsRoute = Ember.Route.extend ScrollTopMixin,
  title: "Project Setting"  + config.platform
  model: ->
    @modelFor("authenticated.project")


`export default AuthenticatedProjectSettingsRoute`
