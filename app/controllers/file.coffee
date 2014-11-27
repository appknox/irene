`import Ember from 'ember'`

FileController = Ember.ObjectController.extend

  sortedAnalysis: (->
    analyses = @get "model.analyses"
    analyses.sortBy('risk').reverse()
  ).property "model.analyses.@each.risk"

`export default FileController`
