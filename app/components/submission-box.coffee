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
    if ENV.isAppknox is true
      name = tourName(ENV.TOUR.newScan)
    else
      name = tourName(ENV.TOUR.devknoxTour)
    try
      readCookies = cookies.read()
      cookieKey = readCookies[name]
      if cookieKey isnt "true"
        if ENV.isAppknox is true
          this.set('onboard.activeTour', ENV.TOUR.newScan)
        else
          this.set('onboard.activeTour', ENV.TOUR.devknoxTour)
        cookies.write(name, true)

  actions:
    startTour: ->
      this.set('onboard.activeTour', ENV.TOUR.manualTour)

`export default SubmissionBoxComponent`
