`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`
`import {isForbiddenError} from 'ember-ajax/errors';`

PricingPlanComponent = Ember.Component.extend

  plan: null
  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY
  classNames: ["column"]
  planQuantity: 1

  initiatePrice: (->
    totalPrice = @get "totalPrice"
    "Pay $#{totalPrice} USD"
  ).property "totalPrice"

  modalText: (->
    planId = @get "plan.planId"
    if planId is "default_per_scan"
      return "Enter the number of scans"
    "Enter the number of apps"
  ).property "plan"

  updatedPrice: (->
    totalPrice = @get "totalPrice"
    planQuantity = @get "planQuantity"
    updatedPrice = totalPrice * planQuantity
    "Pay $#{updatedPrice} USD"
  ).property "totalPrice", "planQuantity"

  totalPrice: (->
    monthlyPrice = @get "plan.monthlyPrice"
    quarterlyPrice = @get "plan.quarterlyPrice"
    halfYearlyPrice = @get "plan.halfYearlyPrice"
    yearlyPrice = @get "plan.yearlyPrice"
    duration = @get "paymentDuration"
    switch duration
      when ENUMS.PAYMENT_DURATION.MONTHLY
        price = @get "plan.monthlyPrice"
      when ENUMS.PAYMENT_DURATION.QUARTERLY
        price = @get "plan.quarterlyPrice"
      when ENUMS.PAYMENT_DURATION.HALFYEARLY
        price = @get "plan.halfYearlyPrice"
      when ENUMS.PAYMENT_DURATION.YEARLY
        price = @get "plan.yearlyPrice"
    price
  ).property "paymentDuration", "plan.monthlyPrice", "plan.quarterlyPrice", "plan.halfYearlyPrice", "plan.yearlyPrice"

  actions:
    initiatePayment: ->
      duration = @get "paymentDuration"
      planQuantity = @get "planQuantity"
      switch duration
        when ENUMS.PAYMENT_DURATION.MONTHLY
          url = @get "plan.monthlyUrl"
        when ENUMS.PAYMENT_DURATION.QUARTERLY
          url = @get "plan.quarterlyUrl"
        when ENUMS.PAYMENT_DURATION.HALFYEARLY
          url = @get "plan.halfYearlyUrl"
        when ENUMS.PAYMENT_DURATION.YEARLY
          url = @get "plan.yearlyUrl"
      updatedUrl = [url, "subscription[plan_quantity]=#{planQuantity}"].join '&'
      window.open(updatedUrl, '_blank');

     updatePrice: ->
       planQuantity = parseInt @$('.plan-quantity').val()
       if isNaN(planQuantity) or planQuantity is 0
         planQuantity = 1
       @set "planQuantity", planQuantity

    togglePlanModal: ->
      @set "showPlanModal", !@get "showPlanModal"


`export default PricingPlanComponent`
