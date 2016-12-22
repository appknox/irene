`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

SubmissionBoxComponent = Ember.Component.extend
  classNames: ["box"]
  onboard: Ember.inject.service()

  didInsertElement: ->
    if localStorage['alreadyShown'] in [false, undefined]
      this.set('onboard.activeTour', ENV.TOUR.newScan)
      localStorage.setItem('alreadyShown', true)

`export default SubmissionBoxComponent`
