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

  vncPopText: (->
    if @get "isPoppedOut"
      "Close Modal"
    else
      "Pop Out Modal"
  ).property "isPoppedOut"

  setupRFB: ->
    rfb = @get "rfb"
    if !Ember.isEmpty rfb
      return
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
        setTimeout(that.set_ratio.bind(that), 500)
        true

      'onXvpInit': ->
        true

    if @get 'file.isReady'
      @send("connect")

  didInsertElement: ->
    @setupRFB()

  screenRequired: ( ->
    platform = @get "file.project.platform"
    deviceType = @get "file.project.deviceType"
    platform is ENUMS.PLATFORM.ANDROID && deviceType is ENUMS.DEVICE_TYPE.TABLET_REQUIRED
  ).property "file.project.platform", "file.project.deviceType"

  statusChange: ( ->
    if @get 'file.isReady'
      @send("connect")
    else
      @send "disconnect"
  ).observes 'file.dynamicStatus'

  deviceType: (->
    platform = @get "file.project.platform"
    deviceType = @get "file.project.deviceType"
    if platform is ENUMS.PLATFORM.ANDROID
      if deviceType is ENUMS.DEVICE_TYPE.TABLET_REQUIRED
        "tablet"
      else
        "nexus5"
    else if platform is ENUMS.PLATFORM.IOS
      if deviceType is ENUMS.DEVICE_TYPE.TABLET_REQUIRED
        "ipad black"
      else
        "iphone5s black"
  ).property "file.project.platform", "file.project.deviceType"

  isNotTablet: (->
    deviceType = @get "file.project.deviceType"
    if deviceType not in [ENUMS.DEVICE_TYPE.NO_PREFERENCE, ENUMS.DEVICE_TYPE.PHONE_REQUIRED]
      true
  ).property "file.project.deviceType"

  isIOSDevice: (->
    platform = @get "file.project.platform"
    if platform is ENUMS.PLATFORM.IOS
      true
  ).property "file.project.platform"

  set_ratio: ->
    rfb = @get "rfb"
    display = rfb.get_display()
    canvasEl = display.get_context().canvas
    bounding_rect = canvasEl.getBoundingClientRect()
    scaleRatio = display.autoscale bounding_rect.width, bounding_rect.height
    rfb.get_mouse().set_scale scaleRatio

  actions:
    togglePop: ->
      @set "isPoppedOut", !@get "isPoppedOut"

    connect: ->
      rfb = @get "rfb"
      deviceToken = @get "file.deviceToken"
      rfb.connect ENV.deviceFarmHost, ENV.deviceFarmPort, '1234', "#{ENV.deviceFarmPath}?token=#{deviceToken}"
      setTimeout(@.set_ratio.bind(@), 500)

    disconnect: ->
      rfb = @get "rfb"
      if rfb._rfb_connection_state is 'connected'
        rfb.disconnect()
      if rfb._rfb_connection_state is 'disconnected'
        @set "rfb", null
        @setupRFB()


`export default VncViewerComponent`
