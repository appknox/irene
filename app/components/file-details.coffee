`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import tourName from 'irene/utils/tour-name';`

{ keys } = Object

FileDetailsComponent = Ember.Component.extend
  classNames: ["column"]
  onboard: Ember.inject.service()
  cookies: Ember.inject.service()

  didInsertElement: ->
    cookies = @get 'cookies'
    name = tourName ENV.TOUR.scanDetail
    try
      readCookies = cookies.read()
      cookieKey = readCookies[name]
      if cookieKey isnt "true"
        @set 'onboard.activeTour', name
        cookies.write name, true

`export default FileDetailsComponent`
