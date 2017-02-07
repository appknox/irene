`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedPricingRoute = Ember.Route.extend ScrollTopMixin,

  title: "Billing"  + config.platform
  model: ->
    @modelFor("authenticated")

`export default AuthenticatedPricingRoute`
