`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`


PricingController = Ember.Controller.extend

  needs: ['application']
  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY

  classMonthly: (->
    if ENUMS.PAYMENT_DURATION.MONTHLY is @get "paymentDuration"
      return "btn-info"
    return "btn-default"
  ).property "paymentDuration"

  classYearly: (->
    if ENUMS.PAYMENT_DURATION.YEARLY is @get "paymentDuration"
      return "btn-info"
    return "btn-default"
  ).property "paymentDuration"

  actions:
    selectMonthly: ->
      @set "paymentDuration", ENUMS.PAYMENT_DURATION.MONTHLY

    selectYearly: ->
      @set "paymentDuration", ENUMS.PAYMENT_DURATION.YEARLY



`export default PricingController`
