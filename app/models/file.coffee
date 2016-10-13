`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`
`import Ember from 'ember'`

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

  pieChartData: Ember.computed 'analyses.@each.risk', ->
    analyses = @get "analyses"
    r = ENUMS.RISK
    highRisk = _getAnalysesCount analyses, r.HIGH
    mediumRisk = _getAnalysesCount analyses, r.MEDIUM
    lowRisk = _getAnalysesCount analyses, r.LOW
    noRisk = _getAnalysesCount analyses, r.NONE
    unknownRisk = _getAnalysesCount analyses, r.UNKNOWN
    [
      {"value": highRisk, "color": "red"},
      {"value": mediumRisk, "color": "yellow"},
      {"value": lowRisk, "color": "blue"},
      {"value": noRisk, "color": "green"}
      {"value": unknownRisk, "color": "black"}
    ]

`export default File`
