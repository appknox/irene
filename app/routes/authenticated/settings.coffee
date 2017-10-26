`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

AuthenticatedSettingsRoute = Ember.Route.extend ScrollTopMixin, RouteTitleMixin,

  subtitle: "Settings"
  model: ->
    @modelFor("authenticated")

`export default AuthenticatedSettingsRoute`
