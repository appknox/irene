`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

AuthenticatedTeamRoute = Ember.Route.extend ScrollTopMixin, RouteTitleMixin,

  subtitle: "Team"
  model: (params) ->
    @get('store').find('team', params.teamId)

`export default AuthenticatedTeamRoute`
