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

  totalPriceAfterDiscount: (->
    couponApplied = @get "couponApplied"
    if couponApplied
      totalPrice = @get "totalPrice"
      discount = @get "couponDiscount"
      return Math.floor(totalPrice - (totalPrice * discount / 100))
    @get "totalPrice"
  ).property "totalPrice", "couponApplied", "couponDiscount"

  totalPricePay: (->
    duration = @get "paymentDuration"
    if duration is ENUMS.PAYMENT_DURATION.MONTHLY
      durationText  = "1 Month"
    if duration is ENUMS.PAYMENT_DURATION.QUATERLY
      durationText  = "3 Months"
    if duration is ENUMS.PAYMENT_DURATION.HALFYEARLY
      durationText  = "6 Months"
    if duration is ENUMS.PAYMENT_DURATION.YEARLY
      durationText  = "1 Year"
    totalPriceAfterDiscount = @get "totalPriceAfterDiscount"
    "Pay $#{totalPriceAfterDiscount} USD for #{durationText}"
  ).property "totalPriceAfterDiscount", "paymentDuration"




`export default PricingPlanComponent`
