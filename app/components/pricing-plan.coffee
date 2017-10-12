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
      duration = @get "paymentDuration"
      switch duration
        when ENUMS.PAYMENT_DURATION.MONTHLY
          url = @get "plan.monthlyUrl"
        when ENUMS.PAYMENT_DURATION.QUARTERLY
          url = @get "plan.quarterlyUrl"
        when ENUMS.PAYMENT_DURATION.HALFYEARLY
          url = @get "plan.halfYearlyUrl"
        when ENUMS.PAYMENT_DURATION.YEARLY
          url = @get "plan.yearlyUrl"
      window.open(url, '_blank');

`export default PricingPlanComponent`
