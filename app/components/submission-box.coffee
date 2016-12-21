`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

SubmissionBoxComponent = Ember.Component.extend
  user: null
  classNames: ["box"]
  onboard: Ember.inject.service()

  didInsertElement: ->
     hasNoProject = @get "user.hasNoProjects"
     if hasNoProject
       this.set('onboard.activeTour', ENV.TOUR.newScan)

`export default SubmissionBoxComponent`
