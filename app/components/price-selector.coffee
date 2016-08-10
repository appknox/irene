`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

isNumber = (n) ->
  /^\d+$/.test n

PriceSelectorComponent = Ember.Component.extend

  pricing: null
  store: null
  paymentDuration: null

  totalPrice: (->
    if ENUMS.PAYMENT_DURATION.MONTHLY is @get "paymentDuration"
      @get "pricing.price"
    else
      @get "pricing.yearlyPrice"
  ).property "paymentDuration"

  totalPricePay: (->
    if ENUMS.PAYMENT_DURATION.MONTHLY is @get "paymentDuration"
      duration  = "Month"
    else
      duration  = "Year"
    totalPrice = @get "totalPrice"
    "Pay #{totalPrice} USD / #{duration}"
  ).property "totalPrice"

  actions:

    makePayment: ->
      applicationController = @container.lookup "controller:application"
      applicationController.set "makePaymentModal.pricing", @get "pricing"
      applicationController.set "makePaymentModal.show", true

`export default PriceSelectorComponent`
