`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`

getRiskCountObject = (risks=[])->
  riskCountObject = {}
  for risk in risks
    riskCountObject[risk] = (riskCountObject[risk] || 0) + 1
  riskCountObject

###
# I picked these colors from app/styles/app.variables.less
# Please always remember to keep this in sync with the colors there.
#
# The variable name that has the color commented alongside
###
getStatArray = (riskCountObject)->
  statArray = []
  if riskCountObject[ENUMS.RISK.HIGH]
    statArray.push
      title: "High"
      value: riskCountObject[ENUMS.RISK.HIGH]
      color: "#EF4836"  # @brand-danger
  if riskCountObject[ENUMS.RISK.MEDIUM]
    statArray.push
      title: "Medium"
      value: riskCountObject[ENUMS.RISK.MEDIUM]
      color: "#F5D76E"  # @brand-warning
  if riskCountObject[ENUMS.RISK.LOW]
    statArray.push
      title: "Low"
      value: riskCountObject[ENUMS.RISK.LOW]
      color: "#2CC2F8"  # @brand-info
  if riskCountObject[ENUMS.RISK.NONE]
    statArray.push
      title: "None"
      value: riskCountObject[ENUMS.RISK.NONE]
      color: "#80C081"  # @brand-success
  if riskCountObject[ENUMS.RISK.UNKNOWN]
    statArray.push
      title: "Unknown"
      value: riskCountObject[ENUMS.RISK.UNKNOWN]
      color: "#6B6B6B"  # No associations
  statArray

drawChart = (that) ->
  risks = that.get "file.risks"
  riskCountObject = getRiskCountObject risks
  statArray = getStatArray riskCountObject
  that.$().html('').drawPieChart statArray

PieChartView = Ember.View.extend
  file: null
  classNames: ["col-md-6", "chart"]

  drawChart:(->
    drawChart @
  ).observes 'file.risks'

  didInsertElement: ->
    drawChart @

  willDestroyElement: ->
    $(".pieTip").hide()

`export default PieChartView`
