`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import tourName from 'irene/utils/tour-name';`

{ keys } = Object

SubmissionBoxComponent = Ember.Component.extend
  classNames: ["box"]
  onboard: Ember.inject.service()
  cookies: Ember.inject.service()

  didInsertElement: ->
    cookieService = @get 'cookies'
    name = tourName(ENV.TOUR.newScan)
    alreadyShown = document.cookie.includes name
    if alreadyShown is false
      this.set('onboard.activeTour', ENV.TOUR.newScan)
      cookieService.write('shownTour1', name)


  actions:
    startTour: ->
      this.set('onboard.activeTour', ENV.TOUR.manualTour)

`export default SubmissionBoxComponent`
