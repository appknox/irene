`import Ember from 'ember'`
`import ENUMS from '../enums'`

getRiskObject = (risks=[])->
  riskObject = {}
  for risk in risks
    riskObject[risk] = (riskObject[risk] || 0) + 1
  riskObject

getStat = (riskObject)->
  stat = []
  if riskObject[ENUMS.RISK.HIGH]
    stat.push
      title: "High"
      value: riskObject[ENUMS.RISK.HIGH]
      color: "#FB4A46"
  if riskObject[ENUMS.RISK.MEDIUM]
    stat.push
      title: "Medium",
      value: riskObject[ENUMS.RISK.MEDIUM],
      color: "#FCD630"
  if riskObject[ENUMS.RISK.LOW]
    stat.push
      title: "Low",
      value: riskObject[ENUMS.RISK.LOW],
      color: "#2CC2F8"
  if riskObject[ENUMS.RISK.NONE]
    stat.push
      title: "None",
      value: riskObject[ENUMS.RISK.NONE],
      color: "#80C081"
  if riskObject[ENUMS.RISK.UNKNOWN]
    stat.push
      title: "Unknown",
      value: riskObject[ENUMS.RISK.UNKNOWN],
      color: "#6B6B6B"
  stat

drawChart = (that) ->
  risks = that.get "file.risks"
  riskObject = getRiskObject risks
  stat = getStat riskObject
  that.$().html('').drawPieChart stat

PieChartView = Ember.View.extend
  file: null
  classNames: ["col-md-6", "chart"]

  drawChart:(->
    drawChart @
  ).observes 'file.risks'

  didInsertElement: ->
    drawChart @

`export default PieChartView`
