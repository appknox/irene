`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import tourName from 'irene/utils/tour-name';`

{ keys } = Object

SubmissionBoxComponent = Ember.Component.extend
  classNames: ["box"]
  onboard: Ember.inject.service()
  cookies: Ember.inject.service()

  didInsertElement: ->
    if ENV.isAppknox is true
      cookies = @get 'cookies'
      name = tourName(ENV.TOUR.newScan)
      try
        readCookies = cookies.read()
        cookieKey = readCookies[name]
        if cookieKey isnt "true"
          this.set('onboard.activeTour', ENV.TOUR.newScan)
          cookies.write(name, true)


  actions:
    startTour: ->
      this.set('onboard.activeTour', ENV.TOUR.manualTour)

`export default SubmissionBoxComponent`
