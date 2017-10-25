`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`

PricingListComponent = Ember.Component.extend

  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY

  plans: (->
    if ENV.product is ENUMS.PRODUCT.DEVKNOX
      return [@get("devknoxPricing")]
    @get("store").findAll("plan")
  ).property()

  sortPlanProperties: ['id']
  sortedPlans: Ember.computed.sort 'plans', 'sortPlanProperties'

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
      id: "devknox",
      name: "Devknox",
      description: "Dashboard Upload, Manual Scan",
      price: ENV.devknoxPrice,
      projectsLimit: 0,
    }
  ).property()

  actions:
    selectDuration: ->
      @set "paymentDuration", $(event.srcElement).data("value")
      @activateDuration event.srcElement

`export default PricingListComponent`
