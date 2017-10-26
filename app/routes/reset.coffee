`import Ember from 'ember'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

ResetRoute = Ember.Route.extend RouteTitleMixin,

  subtitle: "Reset Password"
  model: (params) ->
    params

`export default ResetRoute`
