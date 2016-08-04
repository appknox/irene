`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

isNumber = (n) ->
  /^\d+$/.test n

PriceSelectorComponent = Ember.Component.extend

  count: 1
  pricing: null
  store: null
  paymentDuration: null

  units: (->
    count = @get "count"
    count * @get 'pricing.unit'
  ).property 'count', 'pricing.unit'

  countObserver:(->
    count = @get "count"
    if !isNumber(count) or 1 > count
      @set "count", 1
  ).observes 'count'

  totalPrice: (->
    count =  @get "count"
    price = @get "pricing.price"
    count * price
  ).property "count", "pricing.price"

  totalPriceInCents: (->
    100 * @get "totalPrice"
  ).property "totalPrice"

  totalPricePay: (->
    totalPrice = @get "totalPrice"
    "Pay #{totalPrice} USD"
  ).property "totalPrice"

  userEmail: (->
    @container.lookup("controller:application").get "currentUser.email"
  ).property()

  unitLabel: (->
    pricingType = @get "pricing.pricingType"
    label = ''
    switch pricingType
      when ENUMS.PRICING.SCAN_LIMIT then text = 'Scan'
      when ENUMS.PRICING.TIME_LIMIT then text = 'Month'
      when ENUMS.PRICING.UNKNOWN then text = 'Unknown'
    units = @get "units"
    if units > 1
      text += 's'
    "#{units} #{text}"
  ).property "units"

  actions:

    incrementCount: ->
      count = @get "count"
      @set "count", count + 1

    decrementCount: ->
      count = @get "count"
      count -= 1
      if count < 0
        count = 1
      @set "count", count

    makePayment: ->
      applicationController = @container.lookup "controller:application"
      applicationController.set "makePaymentModal.pricing", @get "pricing"
      applicationController.set "makePaymentModal.count", @get "count"
      applicationController.set "makePaymentModal.show", true

`export default PriceSelectorComponent`
