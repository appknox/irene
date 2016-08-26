`import Ember from 'ember'`

PricingView = Ember.View.extend
  layoutName: "layouts/application"
  didInsertElement: ->
    monthlyButton = $($(".duration-button")[0])
    monthlyButton.removeClass("btn-default")
    monthlyButton.addClass("btn-primary btn-active")

`export default PricingView`
