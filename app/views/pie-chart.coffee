`import Ember from 'ember'`

PieChartView = Ember.View.extend
  stat: null
  classNames: ["col-md-6 chart"]

  drawChart:(->
    @$().drawPieChart @get "stat"
  ).property "stat"

  didInsertElement: ->
    @$().drawPieChart @get "stat"
    # @drawChart()

`export default PieChartView`
