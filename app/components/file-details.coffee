`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

FileDetailsComponent = Ember.Component.extend

  file: null
  classNames: ["column"]

  actions:
    getPDFReportLink: ->
      that = @
      file_id = @get "file.id"
      url = [ENV.endpoints.signedPdfUrl, file_id].join '/'
      @get("ajax").request url
      .then (result) ->
        window.open result.url
      .catch (result) ->
        that.get("notify").error "Please wait while the report is getting generated"

    requestManual: ->
      that = @
      file_id = @get "file.id"
      url = [ENV.endpoints.manual, file_id].join '/'
      @get("ajax").request url
      .then (result) ->
        that.get("notify").info "Manual assessment requested."
      .catch (result) ->
        that.get("notify").error "Something went wrong."

`export default FileDetailsComponent`
