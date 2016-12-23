`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import tourName from 'irene/utils/tour-name';`

SubmissionBoxComponent = Ember.Component.extend
  classNames: ["box"]
  onboard: Ember.inject.service()

  didInsertElement: ->
    name = tourName(ENV.TOUR.newScan)
    if localStorage[name] in ["false", undefined]
      this.set('onboard.activeTour', ENV.TOUR.newScan)
      localStorage.setItem(name, "true")

  actions:
    startTour: ->
      this.set('onboard.activeTour', ENV.TOUR.manualTour)

`export default SubmissionBoxComponent`
