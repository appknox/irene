`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`

PricingPlanComponent = Ember.Component.extend

  pricing: null
  store: null
  paymentDuration: null
  classNames: ["column" , "is-one-third"]

  totalPrice: (->
    price = @get "pricing.price"
    duration = @get "paymentDuration"
    price * duration
  ).property "paymentDuration"

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
    totalPrice = @get "totalPrice"
    "Pay $#{totalPrice} USD for #{durationText}"
  ).property "totalPrice"

  actions:

    makePayment: ->
      return alert "Not Implemented!"
      applicationController = @container.lookup "controller:application"
      applicationController.set "makePaymentModal.priceSelector", @
      applicationController.set "makePaymentModal.show", true
`export default PricingPlanComponent`
