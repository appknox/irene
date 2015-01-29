`import Ember from 'ember'`
`import Notify from 'ember-notify';`

PaypalReturnRoute = Ember.Route.extend
  beforeModel: ->
    Notify.info "Please wait while your payment is being processed", closeAfter: 5000
    @transitionTo 'index'

`export default PaypalReturnRoute`
