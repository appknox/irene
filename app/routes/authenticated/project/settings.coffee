`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

AuthenticatedProjectSettingsRoute = Ember.Route.extend ScrollTopMixin, RouteTitleMixin,

  subtitle: "Project Setting"
  model: ->
    @modelFor("authenticated.project")


`export default AuthenticatedProjectSettingsRoute`
