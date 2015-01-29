`import Ember from 'ember'`
`import Notify from 'ember-notify';`

PaypalCancelRoute = Ember.Route.extend
  beforeModel: ->
    Notify.alert "Your payment has been cancelled!", closeAfter: 5000
    @transitionTo 'index'

`export default PaypalCancelRoute`
