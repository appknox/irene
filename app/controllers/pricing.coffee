`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`


PricingController = Ember.Controller.extend

  model: (->
    @store.all "pricing"
  ).property()

  defaultPricings: Ember.computed.filter 'model', (pricing) ->
    ENUMS.OFFER.NONE is pricing.get "offer"

  scanTypePricings: Ember.computed.filter 'defaultPricings', (pricing) ->
    ENUMS.PRICING.SCAN_LIMIT is pricing.get "pricingType"

  timeTypePricings: Ember.computed.filter 'defaultPricings', (pricing) ->
    ENUMS.PRICING.TIME_LIMIT is pricing.get "pricingType"

  specialPricings: Ember.computed.filter 'model', (pricing) ->
    offer = pricing.get "offer"
    offer is ENUMS.OFFER.CUSTOM or offer is ENUMS.OFFER.FIRST_TIME

`export default PricingController`
