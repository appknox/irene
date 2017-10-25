`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import ENUMS from 'irene/enums';`
`import { translationMacro as t } from 'ember-i18n'`

FileHeaderComponent = Ember.Component.extend

  i18n: Ember.inject.service()
  trial: Ember.inject.service()

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
      analytics.feature(ENV.csb.feature.reportDownload, ENV.csb.module.report, ENV.csb.product.appknox)
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
      file_id = @get "file.id"
      dynamicUrl = [ENV.endpoints.dynamic, file_id].join '/'
      @get("ajax").request dynamicUrl
      .catch (error) ->
        file.setNone()
        for error in error.errors
          that.get("notify").error error.detail?.message

    setAPIScanOption: ->
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
      analytics.feature(ENV.csb.feature.runDynamicScan, ENV.csb.module.security, ENV.csb.product.appknox)
      @set "isApiScanEnabled", false
      @send "setAPIScanOption"

    runAPIScan: ->
      analytics.feature(ENV.csb.feature.runAPIScan, ENV.csb.module.security, ENV.csb.product.appknox)
      @set "isApiScanEnabled", true
      @send "setAPIScanOption"

    showURLFilter: ->
      @set "showAPIURLFilterScanModal", true
      @set "showAPIScanModal", false
      @set "showRunDynamicScanModal", false

    requestManual: ->
      analytics.feature(ENV.csb.feature.requestManualScan, ENV.csb.module.security, ENV.csb.product.appknox)
      tManualRequested = @get "tManualRequested"
      that = @
      file_id = @get "file.id"
      url = [ENV.endpoints.manual, file_id].join '/'
      @get("ajax").request url
      .then (result) ->
        that.get("notify").info tManualRequested
        that.set "file.ifManualNotRequested", false
        that.set "showManualScanModal", false
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    openAPIScanModal: ->
      platform = @get "file.project.platform"
      if platform in [ENUMS.PLATFORM.ANDROID,ENUMS.PLATFORM.IOS] # TEMPIOSDYKEY
        @set "showAPIScanModal", true
      else
        @send "doNotRunAPIScan"

    goBack: ->
      @set "showAPIURLFilterScanModal", false
      if @get "showRunDynamicScanModal"
        @set "showRunDynamicScanModal", true
      else
        @set "showAPIScanModal", true

    closeModal: ->
      @set "showAPIScanModal", false
      @set "showAPIURLFilterScanModal", false
      @set "showRunDynamicScanModal", false

    closeSubscribeModal: ->
      @set "showSubscribeModal", false

    openSubscribeModal: ->
      @set "showSubscribeModal", true

    openManualScanModal: ->
      @set "showManualScanModal", true

    closeManualScanModal: ->
      @set "showManualScanModal", false

    openRunDynamicScanModal: ->
      @set "showRunDynamicScanModal", true

    closeRunDynamicScanModal: ->
      @set "showRunDynamicScanModal", false

    subscribePlan: ->
      window.location.href = "/billing"

    dynamicShutdown: ->
      file = @get "file"
      file.setShuttingDown()
      @set "isPoppedOut", false
      file_id = @get "file.id"
      shutdownUrl = [ENV.endpoints.dynamicShutdown, file_id].join '/'
      @get("ajax").request shutdownUrl
      .then () ->
        file.setNone()
      .catch (error) ->
        file.setNone()
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default FileHeaderComponent`
