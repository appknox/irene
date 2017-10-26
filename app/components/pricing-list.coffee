`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`

PricingListComponent = Ember.Component.extend

  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY

  pricings: (->
    @get("store").findAll("pricing")
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

  actions:
    selectDuration: ->
      @set "paymentDuration", $(event.srcElement).data("value")
      @activateDuration event.srcElement

`export default PricingListComponent`
