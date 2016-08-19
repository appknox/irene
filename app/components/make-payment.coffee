`import Ember from 'ember'`
`import ModalBoxMixin from 'irene/mixins/modal-box'`
`import ENV from 'irene/config/environment';`
`import EmberCLIICAjax from 'ic-ajax';`
`import Notify from 'ember-notify';`
`import ENUMS from 'irene/enums';`

MakePaymentComponent = Ember.Component.extend ModalBoxMixin,

  priceSelector: null

  # Card details
  cardNumber: "5555555555554444"
  cardName: "Dhilip C"
  cardExpiry: ""
  cardCvc: "234"
  couponCode: ""

  couponApplied: false
  couponDiscount: 0

  stripe: Ember.inject.service()

  totalPriceAfterDiscount: (->
    couponApplied = @get "couponApplied"
    if couponApplied
      totalPrice = @get "priceSelector.totalPrice"
      discount = @get "couponDiscount"
      return totalPrice - (totalPrice * discount / 100)
    @get "priceSelector.totalPrice"
  ).property "priceSelector.paymentDuration", "couponApplied", "couponDiscount"

  didInsertElement: ->
    new Card
      form: "##{@elementId} form"
      container: "##{@elementId} .card-wrapper"

  stripeErrorHandler: (response) ->
    Notify.error response.error.message

  actions:

    applyCoupon: ->
      self = @
      url = [ENV.APP.API_BASE, ENV.endpoints.applyCoupon].join '/'
      data =
        pricingId: self.get "priceSelector.pricing.id"
        couponCode: self.get "couponCode"
      xhr = EmberCLIICAjax url:url, type: "post", data: data
      xhr.then (result) ->
        self.set "couponApplied", true
        self.set "couponDiscount", result.discount
        Notify.success "Price Updated"
      , (error)->
        self.set "couponApplied", false
        Notify.error error.jqXHR.responseJSON.message


    makePaymentStripe: ->
      cardNumber =  @get "cardNumber"
      cardCvc = @get "cardCvc"
      cardName = @get "cardName"

      [exp_month, exp_year] = @get("cardExpiry").split " / "
      if !Stripe.card.validateCardNumber cardNumber
        return Notify.error "Please enter a valid card number"
      if !Stripe.card.validateCVC cardCvc
        return Notify.error "Please enter a valid CVC"
      if !Stripe.card.validateExpiry exp_month, exp_year
        return Notify.error "Please enter a valid Expiry date"

      stripe = @get 'stripe'
      self = @

      stripeUrl = [ENV.APP.API_BASE, ENV.endpoints.stripePayment].join '/'
      data =
        number: cardNumber
        cvc: cardCvc
        expMonth: exp_month
        expYear: exp_year
        name: cardName
        couponCode: self.get "couponCode"
        pricingId: self.get "priceSelector.pricing.id"
        paymentDuration: @get "priceSelector.paymentDuration"

      xhr = EmberCLIICAjax url:stripeUrl, type: "post", data: data
      xhr.then (result) ->
        Notify.success "Sucessfully processed your payment. Thank You."
        self.send "closeModal"
        setTimeout ->
          location.reload()
        ,
          5 * 1000
      , (error)->
        Notify.error error.jqXHR.responseJSON.message


`export default MakePaymentComponent`
