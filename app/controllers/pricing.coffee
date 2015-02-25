`import Ember from 'ember'`
`import config from '../config/environment';`
`import ENUMS from '../enums';`


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
    ENUMS.OFFER.CUSTOM isnt pricing.get "offer"

`export default PricingController`
