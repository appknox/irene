`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`
`import {isForbiddenError} from 'ember-ajax/errors';`

CardDetailsComponent = Ember.Component.extend

  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY

  cardCvc: ""
  cardName: ""
  cardExpiry: ""
  couponCode: ""
  cardNumber: ""

  couponDiscount: 0
  couponApplied: false

  isPaymentButtonDisabled: false

  stripe: Ember.inject.service()

  pricing: (->
    pricingId = @get "pricingId"
    @get("store").findRecord("pricing", pricingId)
  ).property "pricingId"

  didInsertElement: ->
    new Card
      form: "##{@elementId} form"
      container: "##{@elementId} .card-wrapper"

  stripeErrorHandler: (response) ->
    @get("notify").error response.error.message


  totalPrice: (->
    price = @get "pricing.price"
    duration = @get "paymentDuration"
    price * duration
  ).property "paymentDuration", "pricing.price"

  totalPriceAfterDiscount: (->
    couponApplied = @get "couponApplied"
    if couponApplied
      totalPrice = @get "totalPrice"
      discount = @get "couponDiscount"
      return Math.floor(totalPrice - (totalPrice * discount / 100))
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

  actions:

    applyCoupon: ->
      that = @
      data =
        pricingId: that.get "pricing.id"
        couponCode: that.get("couponCode").trim()
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
      if typeof Stripe is "undefined"
        return alert "Stripe not available!"
      cardNumber =  @get "cardNumber"
      cardCvc = @get "cardCvc"
      cardName = @get("cardName").trim()

      [exp_month, exp_year] = @get("cardExpiry").split "/"
      [exp_month, exp_month] =  [exp_month.trim(), exp_month.trim()]
      if !Stripe.card.validateCardNumber cardNumber
        return @get("notify").error "Please enter a valid card number"
      if !Stripe.card.validateCVC cardCvc
        return @get("notify").error "Please enter a valid CVC"
      if !Stripe.card.validateExpiry exp_month, exp_year
        return @get("notify").error "Please enter a valid Expiry date"


      data =
        number: cardNumber
        cvc: cardCvc
        expMonth: exp_month
        expYear: exp_year
        name: cardName
        couponCode: @get "couponCode"
        pricingId: @get "pricing.id"
        paymentDuration: @get "paymentDuration"

      paymentUrl = ENV.endpoints.stripePaymentDevknox
      if ENV.isAppknox
        paymentUrl = ENV.endpoints.stripePayment

      that = @
      that.set 'isPaymentButtonDisabled', true
      @get("ajax").post paymentUrl, data: data
      .then (result) ->
        that.get("notify").success "Sucessfully processed your payment. Thank You."
        setTimeout ->
          location.reload()
        ,
          5 * 1000
      .catch (error)->
        for error in error.errors
          that.get("notify").error error.detail?.message
          that.set 'isPaymentButtonDisabled', false

`export default CardDetailsComponent`
