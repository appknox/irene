`import Ember from 'ember'`

AnalysisViewComponent = Ember.Component.extend
  classNames: ["col-md-12"]
  model: null
  showVulnerability: false

  showOrHide: (->
    if @get "showVulnerability"
      "Hide "
    else
      "Show "
  ).property "showVulnerability"

  actions:
    toggleVulnerability: ->
      @set "showVulnerability", !@get "showVulnerability"

`export default AnalysisViewComponent`
