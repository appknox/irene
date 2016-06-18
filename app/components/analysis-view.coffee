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
      return @set "showVulnerability", !@get "showVulnerability"
      # The logic that is blow was for checking if it is a paid owner / not
      if @get "model.isPaidOwner"
        return @set "showVulnerability", !@get "showVulnerability"
      applicationController = @container.lookup "controller:application"
      currentUserId = applicationController.get "currentUser.id"
      ownerId = @get "model.file.project.owner.id"
      if currentUserId is ownerId
        return applicationController.get("upgradePlanModal").send "showModal"
      return alert "The owner of this project `#{@get "model.file.project.owner.username"}` does not have a paid account. So you cannot view any details."


`export default AnalysisViewComponent`
