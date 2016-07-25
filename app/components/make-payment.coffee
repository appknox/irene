`import Ember from 'ember'`
`import ModalBoxMixin from 'irene/mixins/modal-box'`
`import ENV from 'irene/config/environment';`
`import EmberCLIICAjax from 'ic-ajax';`
`import Notify from 'ember-notify';`

MakePaymentComponent = Ember.Component.extend ModalBoxMixin,

  pricing: null
  count: 0

  # Card details
  cardNumber: ""
  cardName: ""
  cardExpiry: ""
  cardCvc: ""
  couponId: ""

  couponApplied: false
  finalPrice: 0

  stripe: Ember.inject.service()

  totalPrice: (->
    couponApplied = @get "couponApplied"
    if couponApplied
      return @get("finalPrice") / 100
    count =  @get "count"
    price = @get "pricing.price"
    count * price
  ).property "count", "pricing.price", "couponApplied", "finalPrice"

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
        pricingId: self.get "pricing.id"
        count: self.get "count"
        couponId: self.get "couponId"
      xhr = EmberCLIICAjax url:url, type: "post", data: data
      xhr.then (result) ->
        self.set "couponApplied", true
        debugger
        self.set "finalPrice", result.amount
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
        pricingId: self.get "pricing.id"
        number: cardNumber
        cvc: cardCvc
        exp_month: exp_month
        exp_year: exp_year
        name: cardName
        count: self.get "count"
        couponId: self.get "couponId"
      xhr = EmberCLIICAjax url:stripeUrl, type: "post", data: data
      xhr.then (result) ->
        Notify.success "Sucessfully processed your payment. Thank You."
        self.send "closeModal"
        setTimeout ->
          location.reload()
        ,
          5 * 1000
        location.reload()
      , (error)->
        Notify.error error.jqXHR.responseJSON.message


`export default MakePaymentComponent`
