`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

FileHeaderComponent = Ember.Component.extend

  i18n: Ember.inject.service()

  globalAlpha:0.4
  radiusRatio:0.9

  tPasswordCopied: t("passwordCopied")
  tPleaseTryAgain: t("pleaseTryAgain")
  tReportIsGettingGenerated: t("reportIsGettingGenerated")
  tManualRequested: t("manualRequested")

  didInsertElement: ->
    tPasswordCopied = @get "tPasswordCopied"
    tPleaseTryAgain = @get "tPleaseTryAgain"
    clipboard = new Clipboard('.copy-password')
    @set "clipboard", clipboard
    that = @
    clipboard.on 'success', (e) ->
      that.get("notify").info tPasswordCopied
      e.clearSelection()
    clipboard.on 'error', ->
      that.get("notify").error tPleaseTryAgain

  willDestroyElement: ->
    clipboard = @get "clipboard"
    clipboard.destroy()

  actions:
    getPDFReportLink: ->
      tReportIsGettingGenerated = @get "tReportIsGettingGenerated"
      that = @
      file_id = @get "file.id"
      url = [ENV.endpoints.signedPdfUrl, file_id].join '/'
      @get("ajax").request url
      .then (result) ->
        window.open result.url
      .catch (error) ->
        that.get("notify").error tReportIsGettingGenerated
        for error in error.errors
          that.get("notify").error error.detail?.message

    requestManual: ->
      tManualRequested = @get "tManualRequested"
      that = @
      file_id = @get "file.id"
      url = [ENV.endpoints.manual, file_id].join '/'
      @get("ajax").request url
      .then (result) ->
        that.get("notify").info tManualRequested
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default FileHeaderComponent`
