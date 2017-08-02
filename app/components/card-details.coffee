`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`
`import {isForbiddenError} from 'ember-ajax/errors';`
`import { translationMacro as t } from 'ember-i18n'`

CardDetailsComponent = Ember.Component.extend

  i18n: Ember.inject.service()
  stripe: Ember.inject.service()

  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY

  cardCvc: ""
  cardName: ""
  cardExpiry: ""
  couponCode: ""
  cardNumber: ""

  couponDiscount: 0
  couponApplied: false

  isPaymentButtonDisabled: false

  tPay: t("pay")
  tUSD: t("usd")
  tYear: t("year")
  tMonth: t("month")
  tCheckCoupon: t("checkCoupon")
  tErrorOccured: t("errorOccured")
  tPriceUpdated: t("priceUpdated")
  tEnterValidCVC: t("enterValidCVC")
  tPaymentSuccessful: t("paymentSuccessful")
  tPaymentSuccessful: t("paymentSuccessful")
  tStripeNotAvailable: t("stripeNotAvailable")
  tEnterValidExpiryDate: t("enterValidExpiryDate")
  tEnterValidCardNumber: t("enterValidCardNumber")

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
    tPay = @get "tPay"
    tUSD = @get "tUSD"
    tMonth = @get "tMonth"
    tYear = @get "tYear"
    duration = @get "paymentDuration"
    if duration is ENUMS.PAYMENT_DURATION.MONTHLY
      durationText  = "1 #{tMonth}"
    if duration is ENUMS.PAYMENT_DURATION.QUATERLY
      durationText  = "3 #{tMonth}"
    if duration is ENUMS.PAYMENT_DURATION.HALFYEARLY
      durationText  = "6 #{tMonth}"
    if duration is ENUMS.PAYMENT_DURATION.YEARLY
      durationText  = "1 #{tYear}"
    totalPriceAfterDiscount = @get "totalPriceAfterDiscount"
    "#{tPay} $#{totalPriceAfterDiscount} #{tUSD} #{durationText}"
  ).property "totalPriceAfterDiscount", "paymentDuration"

  actions:

    applyCoupon: ->
      tPriceUpdated = @get "tPriceUpdated"
      tCheckCoupon = @get "tCheckCoupon"
      tErrorOccured = @get "tErrorOccured"
      that = @
      data =
        pricingId: that.get "pricing.id"
        couponCode: that.get("couponCode").trim()
      @get("ajax").post ENV.endpoints.applyCoupon, data: data
      .then (result) ->
        that.set "couponApplied", true
        that.set "couponDiscount", result.discount
        that.get("notify").success tPriceUpdated
      .catch (error)->
        that.set "couponApplied", false
        if isForbiddenError error
          that.get("notify").error tCheckCoupon
        else
          that.get("notify").error tErrorOccured
        for error in error.errors
          that.get("notify").error error.detail?.message

    makePaymentStripe: ->
      tEnterValidCVC = @get "tEnterValidCVC"
      tPaymentSuccessful = @get "tPaymentSuccessful"
      tStripeNotAvailable = @get "tStripeNotAvailable"
      tEnterValidCardNumber = @get "tEnterValidCardNumber"
      tEnterValidExpiryDate = @get "tEnterValidExpiryDate"

      if typeof Stripe is "undefined"
        return alert tStripeNotAvailable
      cardNumber =  @get "cardNumber"
      cardCvc = @get "cardCvc"
      cardName = @get("cardName").trim()

      [exp_month, exp_year] = @get("cardExpiry").split "/"
      [exp_month, exp_month] =  [exp_month.trim(), exp_month.trim()]
      if !Stripe.card.validateCardNumber cardNumber
        return @get("notify").error tEnterValidCardNumber
      if !Stripe.card.validateCVC cardCvc
        return @get("notify").error tEnterValidCVC
      if !Stripe.card.validateExpiry exp_month, exp_year
        return @get("notify").error tEnterValidExpiryDate


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
        that.get("notify").success tPaymentSuccessful
        that.set 'isPaymentButtonDisabled', false
        setTimeout ->
          window.location.href = "/billing"
        ,
          5 * 1000
      .catch (error)->
        for error in error.errors
          that.get("notify").error error.detail?.message
          that.set 'isPaymentButtonDisabled', false

`export default CardDetailsComponent`
