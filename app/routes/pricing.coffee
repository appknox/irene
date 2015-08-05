`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

PricingRoute = Ember.Route.extend AuthenticatedRouteMixin,
  actions:
    didTransition: ->
      upgradePlanModal = @controller.get "controllers.application.upgradePlanModal"
      if !Ember.isEmpty upgradePlanModal
        upgradePlanModal.send "closeModal"

`export default PricingRoute`
