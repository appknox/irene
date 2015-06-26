`import Ember from 'ember'`

PricingRoute = Ember.Route.extend AuthenticatedRouteMixin,
  actions:
    didTransition: ->
      upgradePlan = @controller.get "controllers.application.upgradePlan"
      if !Ember.isEmpty upgradePlan
        upgradePlan.send "closeModal"

`export default PricingRoute`
