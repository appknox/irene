`import Ember from 'ember'`
`import config from '../config/environment';`
`import EmberCLIICAjax from 'ic-ajax';`

_makePayment = (store, pricingSlug, count) ->
  applicationAdapter = store.adapterFor 'application'
  host = applicationAdapter.get 'host'
  namespace = applicationAdapter.get 'namespace'
  invoceUrl = [host, namespace, 'invoice'].join '/'
  data =
    pricingSlug: pricingSlug
    count: count
  xhr = EmberCLIICAjax url:invoceUrl, type: "get", data: data
  xhr.then (result) ->
    elem = $("#hidden-paypal-form").html result.form
    elem.find("[name='submit']").click()
  , ->
    debugger

PricingController = Ember.Controller.extend
  ppsPrice: config.ppsPrice
  ppmPrice: config.ppmPrice
  ppsCount: 1
  ppmCount: 1

  ppsTotalPrice: (->
    ppsCount = parseInt @get "ppsCount"
    ppsPrice = parseInt @get "ppsPrice"
    "Pay #{ppsPrice * ppsCount} USD"
  ).property "ppsCount"

  ppmTotalPrice: (->
    ppmCount = parseInt @get "ppmCount"
    ppmPrice = parseInt @get "ppmPrice"
    "Pay #{ppmPrice * ppmCount} USD"
  ).property "ppmCount"

  actions:

    incrementPpsCount: ->
      ppsCount = parseInt @get "ppsCount"
      @set "ppsCount", ppsCount + 1

    incrementPpmCount: ->
      ppmCount = parseInt @get "ppmCount"
      @set "ppmCount", ppmCount + 1

    decrementPpsCount: ->
      ppsCount = parseInt @get "ppsCount"
      ppsCount -= 1
      if ppsCount < 0
        ppsCount = 1
      @set "ppsCount", ppsCount

    decrementPpmCount: ->
      ppmCount = parseInt @get "ppmCount"
      ppmCount -= 1
      if ppmCount < 0
        ppmCount = 1
      @set "ppmCount", ppmCount - 1

    makePpsPayment: ->
      _makePayment @store, "pps", @get "ppsCount"

    makePpmPayment: ->
      _makePayment @store, "ppm", @get "ppmCount"

`export default PricingController`
