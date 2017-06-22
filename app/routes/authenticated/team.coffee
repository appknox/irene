`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedTeamRoute = Ember.Route.extend ScrollTopMixin,

  title: "Team"  + config.platform
  model: (params) ->
    @get('store').find('team', params.teamId)

`export default AuthenticatedTeamRoute`
