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

  stripe: Ember.inject.service()

  totalPrice: (->
    count =  @get "count"
    price = @get "pricing.price"
    count * price
  ).property "count", "pricing.price"

  didInsertElement: ->
    new Card
      form: "##{@elementId} form"
      container: "##{@elementId} .card-wrapper"

  stripeErrorHandler: (response) ->
    Notify.error response.error.message

  actions:

    makePaymentPaypal: ->
      invoceUrl = [ENV.APP.API_BASE, ENV.endpoints.invoice].join '/'
      data =
        pricing_id: @get "pricing.id"
        count: @get "count"
      xhr = EmberCLIICAjax url:invoceUrl, type: "get", data: data
      xhr.then (result) ->
        elem = $("#hidden-paypal-form").html result.form
        elem.find("[name='submit']").click()
      , ->
        Notify.error "Oh Dang, some error occured!"

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
      stripe.card.createToken
        number: cardNumber
        cvc: cardCvc
        exp_month: exp_month
        exp_year: exp_year
        name: cardName
      .then (response) ->
        stripeUrl = [ENV.APP.API_BASE, ENV.endpoints.stripePayment].join '/'
        data =
          pricing_id: self.get "pricing.id"
          count: self.get "count"
          stripeToken: response.id
        xhr = EmberCLIICAjax url:stripeUrl, type: "post", data: data
        xhr.then (result) ->
          Notify.success "Sucessfully processed your payment. Thank You."
        , (error)->
          console.log error
          Notify.success "SOmething went wrong when trying to process your card"
      .catch @stripeErrorHandler

`export default MakePaymentComponent`
