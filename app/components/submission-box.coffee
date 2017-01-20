`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import tourName from 'irene/utils/tour-name';`

{ keys } = Object

SubmissionBoxComponent = Ember.Component.extend
  classNames: ["box"]
  onboard: Ember.inject.service()
  cookies: Ember.inject.service()

  didInsertElement: ->
    cookies = @get 'cookies'
    tour = ENV.TOUR.newScan
    if ENV.isDevknox is true
      tour = ENV.TOUR.devknoxTour
    name = tourName tour
    try
      readCookies = cookies.read()
      cookieKey = readCookies[name]
      if cookieKey isnt "true"
        @set 'onboard.activeTour', name
        cookies.write name, true

  actions:
    startTour: ->
      this.set('onboard.activeTour', ENV.TOUR.manualTour)

`export default SubmissionBoxComponent`
