`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`


PricingController = Ember.Controller.extend

  needs: ['application']
  paymentDuration: ENUMS.PAYMENT_DURATION.MONTHLY

  durations: (->
    durations = ENUMS.PAYMENT_DURATION.CHOICES
    durations[0..durations.length-2]
  ).property()

  actions:
    selectDuration: ->
      @set "paymentDuration", $(event.srcElement).data("value")
      $(".duration-button").removeClass("btn-primary active")
      $(".duration-button").addClass("btn-default")
      $(event.srcElement).removeClass("btn-default")
      $(event.srcElement).addClass("btn-primary action")

`export default PricingController`
