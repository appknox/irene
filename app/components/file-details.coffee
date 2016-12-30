`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import tourName from 'irene/utils/tour-name';`

FileDetailsComponent = Ember.Component.extend
  onboard: Ember.inject.service()
  classNames: ["column"]

  didInsertElement: ->
    name = tourName(ENV.TOUR.scanDetail)
    if localStorage[name] in ["false", undefined]
      this.set('onboard.activeTour', ENV.TOUR.scanDetail)
      localStorage.setItem(name, "true")

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
