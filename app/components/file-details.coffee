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

  actions:
    getPDFReportLink: ->
      that = @
      file_id = @get "file.id"
      url = [ENV.endpoints.signedPdfUrl, file_id].join '/'
      @get("ajax").request url
      .then (result) ->
        window.open result.url
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message
        that.get("notify").error "Please wait while the report is getting generated"

    requestManual: ->
      that = @
      file_id = @get "file.id"
      url = [ENV.endpoints.manual, file_id].join '/'
      @get("ajax").request url
      .then (result) ->
        that.get("notify").info "Manual assessment requested."
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    startTour: ->
      this.set('onboard.activeTour', ENV.TOUR.scanDetail)

`export default FileDetailsComponent`
