`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`

PricingListComponent = Ember.Component.extend

  pricings: null
  store: Ember.inject.service()
  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY

  durations: (->
    durations = ENUMS.PAYMENT_DURATION.CHOICES
    durations[0..durations.length-2]
  ).property()

  activateDuration: (element) ->
    $(".js-duration-button").removeClass("is-primary is-active")
    $(".js-duration-button").addClass("is-default")
    $(element).removeClass("is-default")
    $(element).addClass("is-primary is-active")

  didRender: ->
    paymentDuration = @get "paymentDuration"
    element = $(@element).find("[data-value='#{paymentDuration}']")
    @activateDuration element

  devknoxPricing: (->
    store = @get "store"
    store.createRecord "pricing", {
      name: "Devknox",
      description: "Dashboard Upload, Manual Scan",
      price: 9,
      projectsLimit: 0,
    }
  ).property()

  actions:
    selectDuration: ->
      @set "paymentDuration", $(event.srcElement).data("value")
      @activateDuration event.srcElement

`export default PricingListComponent`
