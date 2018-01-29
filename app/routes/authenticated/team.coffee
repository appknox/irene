`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedTeamRoute = Ember.Route.extend ScrollTopMixin,

  title: "Team | Appknox"
  model: (params) ->
    @get('store').find('team', params.teamId)

`export default AuthenticatedTeamRoute`
