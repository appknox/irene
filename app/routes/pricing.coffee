`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

PricingRoute = Ember.Route.extend AuthenticatedRouteMixin,
  actions:
    didTransition: ->
      upgradePlan = @controller.get "controllers.application.upgradePlan"
      if !Ember.isEmpty upgradePlan
        upgradePlan.send "closeModal"

`export default PricingRoute`
