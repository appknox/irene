`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

AuthenticatedTeamsRoute = Ember.Route.extend RouteTitleMixin, ScrollTopMixin,

  subtitle: "Teams"

  model: (params) ->
    @get('store').findAll('team')

`export default AuthenticatedTeamsRoute`
