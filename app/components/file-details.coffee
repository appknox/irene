`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`

{ keys } = Object

FileDetailsComponent = Ember.Component.extend

  classNames: ["column"]
  vulnerabilityType: ENUMS.VULNERABILITY_TYPE.UNKNOWN
  vulnerabilityTypes: ENUMS.VULNERABILITY_TYPE.CHOICES[0...-1]

  analyses: (->
    @get "file.sortedAnalyses"
  ).property "file.sortedAnalyses"

  filteredAnalysis: Ember.computed 'analyses', 'vulnerabilityType',  ->
    vulnerabilityType = parseInt @get "vulnerabilityType"
    analyses = @get "analyses"
    if vulnerabilityType is ENUMS.VULNERABILITY_TYPE.UNKNOWN
      return analyses
    filteredAnalysis = []
    for analysis in analyses
      if analysis.hasType vulnerabilityType
        filteredAnalysis.push analysis
    filteredAnalysis

  actions:
    filterVulnerabilityType: ->
      select = $(@element).find("#filter-vulnerability-type")
      @set "vulnerabilityType", select.val()

`export default FileDetailsComponent`
