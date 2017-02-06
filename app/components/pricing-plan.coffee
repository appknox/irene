`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`
`import {isForbiddenError} from 'ember-ajax/errors';`

PricingPlanComponent = Ember.Component.extend

  pricing: null
  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY
  classNames: ["column" , "is-one-third"]

  totalPrice: (->
    price = @get "pricing.price"
    duration = @get "paymentDuration"
    price * duration
  ).property "paymentDuration", "pricing.price"

`export default PricingPlanComponent`
