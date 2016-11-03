`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`

PricingListComponent = Ember.Component.extend

  pricings: null
  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY

  durations: (->
    durations = ENUMS.PAYMENT_DURATION.CHOICES
    durations[0..durations.length-2]
  ).property()

  actions:
    selectDuration: ->
      @set "paymentDuration", $(event.srcElement).data("value")
      $(".js-duration-button").removeClass("is-primary is-active")
      $(".js-duration-button").addClass("is-default")
      $(event.srcElement).removeClass("is-default")
      $(event.srcElement).addClass("is-primary is-active")

`export default PricingListComponent`
