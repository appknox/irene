`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`
`import {isForbiddenError} from 'ember-ajax/errors';`

PricingPlanComponent = Ember.Component.extend

  pricing: null
  paymentDuration: null
  showPricingModal: false
  classNames: ["column" , "is-one-third"]


  cardCvc: ""
  cardName: ""
  cardExpiry: ""
  couponCode: ""
  cardNumber: ""

  couponDiscount: 0
  couponApplied: false

  stripe: Ember.inject.service()

  totalPrice: (->
    price = @get "pricing.price"
    duration = @get "paymentDuration"
    price * duration
  ).property "paymentDuration"

  totalPriceAfterDiscount: (->
    couponApplied = @get "couponApplied"
    if couponApplied
      totalPrice = @get "totalPrice"
      discount = @get "couponDiscount"
      return totalPrice - (totalPrice * discount / 100)
    @get "totalPrice"
  ).property "totalPrice", "couponApplied", "couponDiscount"

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
    totalPriceAfterDiscount = @get "totalPriceAfterDiscount"
    "Pay $#{totalPriceAfterDiscount} USD for #{durationText}"
  ).property "totalPriceAfterDiscount", "paymentDuration"


  didInsertElement: ->
    new Card
      form: "##{@elementId} form"
      container: "##{@elementId} .card-wrapper"

  stripeErrorHandler: (response) ->
    @get("notify").error response.error.message

  actions:

    closeModal: ->
      @set "showPricingModal", false

    makePayment: ->
      @set "showPricingModal", !@get "showPricingModal"

    applyCoupon: ->
      that = @
      data =
        pricingId: that.get "pricing.id"
        couponCode: that.get "couponCode"
      @get("ajax").post ENV.endpoints.applyCoupon, data: data
      .then (result) ->
        that.set "couponApplied", true
        that.set "couponDiscount", result.discount
        that.get("notify").success "Price Updated"
      .catch (error)->
        that.set "couponApplied", false
        if isForbiddenError error
          that.get("notify").error "Please check your coupon"
        else
          that.get("notify").error "Some Unknown error occured"
        for error in error.errors
          that.get("notify").error error.detail?.message

    makePaymentStripe: ->
      cardNumber =  @get "cardNumber"
      cardCvc = @get "cardCvc"
      cardName = @get "cardName"

      [exp_month, exp_year] = @get("cardExpiry").split " / "
      if !Stripe.card.validateCardNumber cardNumber
        return @get("notify").error "Please enter a valid card number"
      if !Stripe.card.validateCVC cardCvc
        return @get("notify").error "Please enter a valid CVC"
      if !Stripe.card.validateExpiry exp_month, exp_year
        return @get("notify").error "Please enter a valid Expiry date"

      that = @

      data =
        number: cardNumber
        cvc: cardCvc
        expMonth: exp_month
        expYear: exp_year
        name: cardName
        couponCode: that.get "couponCode"
        pricingId: that.get "pricing.id"
        paymentDuration: @get "paymentDuration"

      paymentUrl = ENV.endpoints.stripePaymentDevknox
      if ENV.isAppknox
        paymentUrl = ENV.endpoints.stripePayment

      @get("ajax").post paymentUrl, data: data
      .then (result) ->
        that.get("notify").success "Sucessfully processed your payment. Thank You."
        that.send "closeModal"
        setTimeout ->
          location.reload()
        ,
          5 * 1000
      .catch (error)->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default PricingPlanComponent`
