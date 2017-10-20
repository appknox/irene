`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedPaymentRoute = Ember.Route.extend ScrollTopMixin,

  title: "Payment"
  model: (params)->
    params.paymentDuration = parseInt params.paymentDuration
    params

`export default AuthenticatedPaymentRoute`
