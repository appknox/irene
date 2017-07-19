`import Ember from 'ember'`
`import config from 'irene/config/environment'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedTeamsRoute = Ember.Route.extend ScrollTopMixin,

  title: "Teams"  + config.platform
  model: (params) ->
    @get('store').findAll('team')

`export default AuthenticatedTeamsRoute`
