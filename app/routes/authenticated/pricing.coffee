`import Ember from 'ember'`

AuthenticatedPricingRoute = Ember.Route.extend
  model: () ->
    @get('store').findAll('pricing')
    
`export default AuthenticatedPricingRoute`
