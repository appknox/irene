`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`
`import {isForbiddenError} from 'ember-ajax/errors';`

PricingPlanComponent = Ember.Component.extend

  plan: null
  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY
  classNames: ["column" , "is-one-third"]

  totalPrice: (->
    price = @get "plan.price"
    duration = @get "paymentDuration"
    total = price * duration
    "Pay $#{total} USD"
  ).property "paymentDuration", "plan.price"

  actions:
    initiatePayment: ->
      window.open(@get "plan.url", '_blank');

`export default PricingPlanComponent`
