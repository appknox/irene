`import Ember from 'ember'`

CardDetailsComponent = Ember.Component.extend

  pricing: null
  
  cardCvc: ""
  cardName: ""
  cardExpiry: ""
  couponCode: ""
  cardNumber: ""

  couponDiscount: 0
  couponApplied: false

  stripe: Ember.inject.service()


  didInsertElement: ->
    new Card
      form: "##{@elementId} form"
      container: "##{@elementId} .card-wrapper"

  stripeErrorHandler: (response) ->
    @get("notify").error response.error.message

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
`export default CardDetailsComponent`
