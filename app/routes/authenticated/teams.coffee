`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedTeamsRoute = Ember.Route.extend ScrollTopMixin,

  title: "Teams | Appknox"
  model: (params) ->
    @get('store').findAll('team')

`export default AuthenticatedTeamsRoute`
