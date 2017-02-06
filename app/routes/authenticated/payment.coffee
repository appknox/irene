`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedPaymentRoute = Ember.Route.extend ScrollTopMixin,

  title: "Payment" + config.platform
  model: (params)->
    @get('store').find('pricing', params.pricingId)

`export default AuthenticatedPaymentRoute`
