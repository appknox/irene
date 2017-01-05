`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import tourName from 'irene/utils/tour-name';`

SubmissionBoxComponent = Ember.Component.extend
  classNames: ["box"]
  onboard: Ember.inject.service()

  didInsertElement: ->
    name = tourName(ENV.TOUR.newScan)
    cookie = document.cookie
    alreadyShown = cookie.includes name
    if alreadyShown is false
      this.set('onboard.activeTour', ENV.TOUR.newScan)
      document.cookie = name

  actions:
    startTour: ->
      this.set('onboard.activeTour', ENV.TOUR.manualTour)

`export default SubmissionBoxComponent`
