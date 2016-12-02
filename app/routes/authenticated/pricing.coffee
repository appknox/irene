`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedPricingRoute = Ember.Route.extend

  title: "Pricing"  + config.Platform
  model: ->
    @modelFor("authenticated").get('pricings')

`export default AuthenticatedPricingRoute`
