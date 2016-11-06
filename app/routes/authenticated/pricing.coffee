`import Ember from 'ember'`

AuthenticatedPricingRoute = Ember.Route.extend

  model: ->
    @modelFor("authenticated").get('pricings')

`export default AuthenticatedPricingRoute`
