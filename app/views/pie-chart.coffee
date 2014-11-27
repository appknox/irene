`import Ember from 'ember'`
`import ENUMS from '../enums'`

getRiskObject = (risks=[])->
  riskObject = {}
  for risk in risks
    riskObject[risk] = (riskObject[risk] || 0) + 1
  riskObject

###
# I picked these colors from app/styles/app.variables.less
# Please always remember to keep this in sync with the colors there.
#
# The variable name that has the color commented alongside
###
getStat = (riskObject)->
  stat = []
  if riskObject[ENUMS.RISK.HIGH]
    stat.push
      title: "High"
      value: riskObject[ENUMS.RISK.HIGH]
      color: "#EF4836"  # @brand-danger
  if riskObject[ENUMS.RISK.MEDIUM]
    stat.push
      title: "Medium"
      value: riskObject[ENUMS.RISK.MEDIUM]
      color: "#F5D76E"  # @brand-warning
  if riskObject[ENUMS.RISK.LOW]
    stat.push
      title: "Low"
      value: riskObject[ENUMS.RISK.LOW]
      color: "#2CC2F8"  # @brand-info
  if riskObject[ENUMS.RISK.NONE]
    stat.push
      title: "None"
      value: riskObject[ENUMS.RISK.NONE]
      color: "#80C081"  # @brand-success
  if riskObject[ENUMS.RISK.UNKNOWN]
    stat.push
      title: "Unknown"
      value: riskObject[ENUMS.RISK.UNKNOWN]
      color: "#6B6B6B"  # No associations
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
