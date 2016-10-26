`import Ember from 'ember'`

CompareFilesComponent = Ember.Component.extend

  file1: null
  file2: null
  isSummary: true

  summaryClass: Ember.computed "isSummary", ->
    if @get "isSummary"
      "is-active"

  detailsClass: Ember.computed "isSummary", ->
    if !@get "isSummary"
      "is-active"


  comparisons: (->
    comparisons = []
    file1Analyses = @get "file1.analyses"
    file2Analyses = @get "file2.analyses"
    return if !file1Analyses or !file2Analyses
    file1Analyses.forEach (analysis) ->
      vulnerability = analysis.get "vulnerability"
      vulnerability_id  = parseInt vulnerability.get "id"
      comparisons[vulnerability_id] = {} if !comparisons[vulnerability_id]
      comparisons[vulnerability_id]["analysis1"] = analysis
      comparisons[vulnerability_id]["vulnerability"] = vulnerability
    file2Analyses.forEach (analysis) ->
      vulnerability = analysis.get "vulnerability"
      vulnerability_id  = parseInt vulnerability.get "id"
      comparisons[vulnerability_id] = {} if !comparisons[vulnerability_id]
      comparisons[vulnerability_id]["analysis2"] = analysis
      comparisons[vulnerability_id]["vulnerability"] = vulnerability
    comparisons.removeObject undefined
    comparisons
  ).property "file1.analyses.@each.risk", "file2.analyses.@each.risk"


  actions:
    displaySummary: ->
      @set "isSummary", true

    displayDetails: ->
      @set "isSummary", false

`export default CompareFilesComponent`
