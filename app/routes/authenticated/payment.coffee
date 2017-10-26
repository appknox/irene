`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

AuthenticatedPaymentRoute = Ember.Route.extend ScrollTopMixin, RouteTitleMixin,

  subtitle: "Payment"
  model: (params)->
    params.paymentDuration = parseInt params.paymentDuration
    params

`export default AuthenticatedPaymentRoute`
