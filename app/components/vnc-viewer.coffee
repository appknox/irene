`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

vncHeight = 512
vncWidth = 385

VncViewerComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  onboard: Ember.inject.service()

  rfb: null
  file: null
  isPoppedOut: false
  classNameBindings: ["isPoppedOut:modal", "isPoppedOut:is-active"]

  tStartingScan: t("startingScan")

  vncPopText: (->
    if @get "isPoppedOut"
      "Close Modal"
    else
      "Pop Out Modal"
  ).property "isPoppedOut"

  didInsertElement: ->
    canvasEl = @element.getElementsByClassName("canvas")[0]
    that = @
    @set "rfb", new RFB
      'target': canvasEl
      'encrypt': ENV.deviceFarmSsl
      'repeaterID': ''
      'true_color': true
      'local_cursor': false
      'shared': true
      'view_only': false

      'onUpdateState': ->
        if ENUMS.PLATFORM.IOS isnt that.get "file.project.platform"
          # Only resize iOS Devices
          return true
        display = @get_display()
        scaleRatio = display.autoscale vncHeight, vncWidth  # TODO: This needs to be set Dynamically
        @get_mouse().set_scale scaleRatio
        true

      'onXvpInit': ->
        true

    if @get 'file.isReady'
      @send("connect")

  statusChange: ( ->
    if @get 'file.isReady'
      @send("connect")
    else
      @send "disconnect"
  ).observes 'file.dynamicStatus'

  actions:
    togglePop: ->
      @set "isPoppedOut", !@get "isPoppedOut"

    connect: ->
      rfb = @get "rfb"
      deviceToken = @get "file.deviceToken"
      rfb.connect ENV.deviceFarmHost, ENV.deviceFarmPort, '1234', "#{ENV.deviceFarmPath}?token=#{deviceToken}"

    disconnect: ->
      rfb = @get "rfb"
      if rfb._rfb_connection_state is 'connected'
        rfb.disconnect()

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

    doNotRunAPIScan: ->
      @set "isApiScanEnabled", false
      @send "isApiScanEnabled"

    runAPIScan: ->
      @set "isApiScanEnabled", true
      @send "isApiScanEnabled"

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

    dynamicShutdown: ->
      file = @get "file"
      file.setShuttingDown()
      @set "isPoppedOut", false
      file_id = @get "file.id"
      shutdownUrl = [ENV.endpoints.dynamicShutdown, file_id].join '/'
      @get("ajax").request shutdownUrl
      .catch (error) ->
        file.setNone()
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

`export default VncViewerComponent`
