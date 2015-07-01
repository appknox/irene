`import Ember from 'ember'`
`import Notify from 'ember-notify';`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

PaypalReturnRoute = Ember.Route.extend AuthenticatedRouteMixin,
  beforeModel: ->
    Notify.info "Please wait while your payment is being processed", closeAfter: 5000
    @transitionTo 'index'

`export default PaypalReturnRoute`
