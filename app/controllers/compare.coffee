`import Ember from 'ember'`

CompareController = Ember.ArrayController.extend
  needs: ['application']
  file1: null
  file2: null

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

  ).property "file1.analyses.@each.risk", "file2.analyses.@each.risk"

`export default CompareController`
