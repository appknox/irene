`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import ENUMS from 'irene/enums';`
`import { translationMacro as t } from 'ember-i18n'`

FileHeaderComponent = Ember.Component.extend

  i18n: Ember.inject.service()

  globalAlpha:0.4
  radiusRatio:0.9

  tPasswordCopied: t("passwordCopied")
  tPleaseTryAgain: t("pleaseTryAgain")
  tReportIsGettingGenerated: t("reportIsGettingGenerated")
  tManualRequested: t("manualRequested")
  tStartingScan: t("startingScan")

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

    dynamicScan: ->
      file = @get "file"
      file.setBootingStatus()
      @set "file.isDynamicDone", false
      file_id = @get "file.id"
      dynamicUrl = [ENV.endpoints.dynamic, file_id].join '/'
      @get("ajax").request dynamicUrl
      .catch (error) ->
        file.setNone()
        for error in error.errors
          that.get("notify").error error.detail?.message

    isApiScanEnabled: ->
      tStartingScan = @get "tStartingScan"
      isApiScanEnabled = @get "isApiScanEnabled"
      project_id = @get "file.project.id"
      apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, project_id].join '/'
      that = @
      data =
        isApiScanEnabled: isApiScanEnabled
      @get("ajax").post apiScanOptions, data: data
      .then (data)->
        that.send "closeModal"
        that.send "dynamicScan"
        that.get("notify").success tStartingScan
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message


    doNotRunAPIScan: ->
      @set "isApiScanEnabled", false
      @send "isApiScanEnabled"

    runAPIScan: ->
      @set "isApiScanEnabled", true
      @send "isApiScanEnabled"

    requestManual: ->
      tManualRequested = @get "tManualRequested"
      that = @
      file_id = @get "file.id"
      url = [ENV.endpoints.manual, file_id].join '/'
      @get("ajax").request url
      .then (result) ->
        that.get("notify").info tManualRequested
        that.set "file.ifManualNotRequested", false
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    openAPIScanModal: ->
      platform = @get "file.project.platform"
      if platform in [ENUMS.PLATFORM.ANDROID,ENUMS.PLATFORM.IOS] # TEMPIOSDYKEY
        @set "showAPIScanModal", true
      else
        @send "doNotRunAPIScan"

    closeModal: ->
      @set "showAPIScanModal", false

`export default FileHeaderComponent`
