`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

SubmissionBoxComponent = Ember.Component.extend
  classNames: ["box"]
  onboard: Ember.inject.service()

  didInsertElement: ->
    this.set('onboard.activeTour', ENV.TOUR.newScan)

`export default SubmissionBoxComponent`
