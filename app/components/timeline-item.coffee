`import Ember from 'ember'`

TimelineItemComponent = Ember.Component.extend
  tagName: "article"
  classNames: ["timeline-item"]
  classNameBindings: ["itemClass"]
  model: null
  file1: null
  file2: null

  itemClass: (->
    id = @get "model.id"
    if id % 2 is 0
      "alt"
  ).property "model.id"

  arrowClass: (->
    id = @get "model.id"
    if id % 2 is 0
      "right"
    else
      "left"
  ).property "model.id"

  file1Analysis: (->
    that = @
    analyses = @get "file1.analyses"
    return if Ember.isEmpty analyses
    analyses.filter((analysis) ->
      analysis.get('vulnerability.id') is that.get "model.id")[0]
  ).property "file1.analyses.@each"

  file2Analysis: (->
    that = @
    analyses = @get "file2.analyses"
    return if Ember.isEmpty analyses
    analyses.filter((analysis) ->
      analysis.get('vulnerability.id') is that.get "model.id")[0]
  ).property "file2.analyses.@each"

  compareColor: (->
    file1Risk = @get "file1Analysis.risk"
    file2Risk = @get "file2Analysis.risk"
    console.error file1Risk, file2Risk
    file1Risk - file2Risk
  ).property "file1Analysis.risk", "file2Analysis.risk"

`export default TimelineItemComponent`
