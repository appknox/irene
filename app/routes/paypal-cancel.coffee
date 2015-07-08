`import Ember from 'ember'`
`import Notify from 'ember-notify';`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

PaypalCancelRoute = Ember.Route.extend AuthenticatedRouteMixin,
  beforeModel: ->
    Notify.alert "Your payment has been cancelled!", closeAfter: 5000
    @transitionTo 'index'

`export default PaypalCancelRoute`
