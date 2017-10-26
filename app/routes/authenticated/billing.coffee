`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

AuthenticatedBillingRoute = Ember.Route.extend ScrollTopMixin, RouteTitleMixin,

  subtitle: "Billing"
  model: ->
    @modelFor("authenticated")

`export default AuthenticatedBillingRoute`
