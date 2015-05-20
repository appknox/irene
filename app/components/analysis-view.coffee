`import Ember from 'ember'`
`import Notify from 'ember-notify';`

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
        return Notify.error "Please susbcribe to a standard / custom plan to avail this feature."
      @set "showVulnerability", !@get "showVulnerability"

`export default AnalysisViewComponent`
