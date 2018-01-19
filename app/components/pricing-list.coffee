`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`

PricingListComponent = Ember.Component.extend

  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY

  subscriptions: (->
    that = @
    subscriptions = @get("store").findAll("subscription")
      .then (data)->
        that.set "subscriptions", data
        if data.isLoaded is true
          plans = that.get("store").findAll("plan")
          that.set "plans", plans
  ).property()

  subscription: Ember.computed.alias('subscriptions.firstObject')

  subscriptionCount: Ember.computed.alias('subscriptions.length')

  hasSubscription: Ember.computed.gt 'subscriptionCount', 0

  hasNoSubscription: Ember.computed.equal 'subscriptionCount', 0

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
