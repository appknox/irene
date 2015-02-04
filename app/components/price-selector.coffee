`import Ember from 'ember'`
`import EmberCLIICAjax from 'ic-ajax';`
`import ENUMS from '../enums';`

isNumber = (n) ->
  /^\d+$/.test n

PriceSelectorComponent = Ember.Component.extend

  count: 1
  pricing: null
  store: null

  countObserver:(->
    count = @get "count"
    if !isNumber(count) or 1 > parseInt count
      @set "count", 1
  ).observes 'count'

  totalPrice: (->
    count = parseInt @get "count"
    price = @get "pricing.price"
    "Pay #{price * count} USD"
  ).property "count", "pricing.price"

  unitLabel: (->
    pricingType = @get "pricing.pricingType"
    label = ''
    switch pricingType
      when ENUMS.PRICING.SCAN_LIMIT then label = 'Scan'
      when ENUMS.PRICING.TIME_LIMIT then label = 'Month'
      when ENUMS.PRICING.UNKNOWN then label = 'Unknown'
    count = parseInt @get "count"
    if count > 1
      label += 's'
    label
  ).property "count"

  actions:

    incrementCount: ->
      count = parseInt @get "count"
      @set "count", count + 1

    decrementCount: ->
      count = parseInt @get "count"
      count -= 1
      if count < 0
        count = 1
      @set "count", count

    makePayment: ->
      applicationAdapter = @store.adapterFor 'application'
      host = applicationAdapter.get 'host'
      namespace = applicationAdapter.get 'namespace'
      invoceUrl = [host, namespace, 'invoice'].join '/'
      data =
        pricing_id: @get "pricing.id"
        count: @get "count"
      xhr = EmberCLIICAjax url:invoceUrl, type: "get", data: data
      xhr.then (result) ->
        elem = $("#hidden-paypal-form").html result.form
        elem.find("[name='submit']").click()
      , ->
        debugger

`export default PriceSelectorComponent`
