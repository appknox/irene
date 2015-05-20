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
      pricing = @get "model.file.project.owner.pricing"
      if Ember.isEmpty pricing
        return @container.lookup("controller:application").get("upgradePlan").send "showModal"
      @set "showVulnerability", !@get "showVulnerability"

`export default AnalysisViewComponent`
