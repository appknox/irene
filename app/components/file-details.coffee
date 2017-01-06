`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import tourName from 'irene/utils/tour-name';`

FileDetailsComponent = Ember.Component.extend
  onboard: Ember.inject.service()
  classNames: ["column"]

  didInsertElement: ->
    name = tourName(ENV.TOUR.scanDetail)
    alreadyShown = Ember.A(document.cookie).includes name
    if alreadyShown is false
      this.set('onboard.activeTour', ENV.TOUR.scanDetail)
      document.cookie += name

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
