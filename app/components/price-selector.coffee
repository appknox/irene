`import Ember from 'ember'`
`import EmberCLIICAjax from 'ic-ajax';`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`

isNumber = (n) ->
  /^\d+$/.test n

PriceSelectorComponent = Ember.Component.extend

  count: 1
  pricing: null
  store: null

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
    "Pay #{price * count} USD"
  ).property "count", "pricing.price"

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
      invoceUrl = [ENV.APP.API_BASE, ENV.endpoints.invoice].join '/'
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
