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
        display = @get_display()
        scaleRatio = display.autoscale vncHeight, vncWidth  # TODO: This needs to be set Dynamically
        @get_mouse().set_scale scaleRatio
        true

      'onXvpInit': ->
        true

    if @get 'file.isReady'
      @send("connect")


  didUpdate: ->
    @setupRFB()

  didInsertElement: ->
    @setupRFB()

  statusChange: ( ->
    if @get 'file.isReady'
      @send("connect")
    else
      @send "disconnect"
  ).observes 'file.dynamicStatus'

  isAndroidDevice: (->
    platform = @get "file.project.platform"
    if platform is ENUMS.PLATFORM.ANDROID
      true
  ).property "file.project.platform"

  isIOSDevice: (->
    platform = @get "file.project.platform"
    if platform is ENUMS.PLATFORM.IOS
      true
  ).property "file.project.platform"

  isNeitherAndroidNorIOS: (->
    platform = @get "file.project.platform"
    if platform not in [ENUMS.PLATFORM.ANDROID, ENUMS.PLATFORM.IOS]
      true
  ).property "file.project.platform"

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

`export default VncViewerComponent`
