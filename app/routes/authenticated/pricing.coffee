`import Ember from 'ember'`

AuthenticatedPricingRoute = Ember.Route.extend

  titleToken: "Pricing"
  model: ->
    @modelFor("authenticated").get('pricings')

`export default AuthenticatedPricingRoute`
