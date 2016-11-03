`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`
`import Ember from 'ember'`

_getComputedColor = (selector) ->
  el = document.querySelector "#hiddencolorholder .is-#{selector}"
  computedStyle = window.getComputedStyle el
  computedStyle.getPropertyValue "color"


_getAnalysesCount = (analyses, risk)->
  analyses.filterBy('risk', risk).get('length')

File = DS.Model.extend BaseModelMixin,
  project: DS.belongsTo 'project', inverse:'files'
  uuid: DS.attr 'string'
  deviceToken: DS.attr 'string'
  version: DS.attr 'string'
  iconUrl: DS.attr 'string'
  md5hash: DS.attr 'string'
  sha1hash: DS.attr 'string'
  name: DS.attr 'string'
  dynamicStatus: DS.attr 'number'
  analyses: DS.hasMany 'analysis', inverse: 'file'
  report: DS.attr 'string'
  manual: DS.attr 'number'

  analysesSorting: ['risk:desc']
  sortedAnalyses: Ember.computed.sort 'analyses', 'analysesSorting'

  countRiskHigh: 0
  countRiskMedium: 0
  countRiskLow: 0
  countRiskNone: 0
  countRiskUnknown: 0

  pieChartData: Ember.computed 'analyses.@each.risk', ->
    analyses = @get "analyses"
    r = ENUMS.RISK
    countRiskHigh = _getAnalysesCount analyses, r.HIGH
    countRiskMedium = _getAnalysesCount analyses, r.MEDIUM
    countRiskLow = _getAnalysesCount analyses, r.LOW
    countRiskNone = _getAnalysesCount analyses, r.NONE
    countRiskUnknown = _getAnalysesCount analyses, r.UNKNOWN

    @set "countRiskHigh", countRiskHigh
    @set "countRiskMedium", countRiskMedium
    @set "countRiskLow", countRiskLow
    @set "countRiskNone", countRiskNone
    @set "countRiskUnknown", countRiskUnknown
    [
      {"value": countRiskHigh, "color": _getComputedColor "danger"},
      {"value": countRiskMedium, "color": _getComputedColor "warning"},
      {"value": countRiskLow, "color": _getComputedColor "info"},
      {"value": countRiskNone, "color": _getComputedColor "success"}
      {"value": countRiskUnknown, "color": _getComputedColor "default"}
    ]


  otherFilesInTheProject: Ember.computed.filter 'project.files', (file) ->
    file_id = @get "id"
    file_id isnt file.get "id"

  isNoneStaus: (->
    status = @get 'dynamicStatus'
    status is ENUMS.DYNAMIC_STATUS.NONE
  ).property 'dynamicStatus'

  isReady: (->
    status = @get 'dynamicStatus'
    status is ENUMS.DYNAMIC_STATUS.READY
  ).property 'dynamicStatus'

  isBooting: (->
    status = @get 'dynamicStatus'
    status is ENUMS.DYNAMIC_STATUS.BOOTING
  ).property 'dynamicStatus'

  isShuttingDown: (->
    status = @get 'dynamicStatus'
    status is ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN
  ).property 'dynamicStatus'

`export default File`
