`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`
`import ConnectorRFB from 'irene/utils/connector-rfb';`

vncHeight = 512
vncWidth = 385

VncViewerComponent = Ember.Component.extend
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

  didInsertElement: ->
    canvasEl = @element.getElementsByClassName("canvas")[0]
    isPlatformIos = ENUMS.PLATFORM.IOS is @get "file.platform"
    @set "rfb", new RFB
      'target': canvasEl
      'encrypt': ENV.deviceFarmSsl
      'repeaterID': ''
      'true_color': true
      'local_cursor': false
      'shared': true
      'view_only': false

      'onUpdateState': ->
        if isPlatformIos
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
      @connector.connect()
      rfb = @get "rfb"
      deviceToken = @get "file.deviceToken"
      rfb.connect ENV.deviceFarmHost, ENV.deviceFarmPort, '1234', "#{ENV.deviceFarmPath}?token=#{deviceToken}"

    disconnect: ->
      rfb = @get "rfb"
      rfb.disconnect()

    dynamicScan: ->
      file = @get "file"
      file.setBootingStatus()
      file_id = @get "file.id"
      dynamicUrl = [ENV.endpoints.dynamic, file_id].join '/'
      @get("ajax").request dynamicUrl
      .catch ->
        file.setNone()


    dynamicShutdown: ->
      file = @get "file"
      file.setShuttingDown()
      @set "isPoppedOut", false
      file_id = @get "file.id"
      shutdownUrl = [ENV.endpoints.dynamicShutdown, file_id].join '/'
      @get("ajax").request shutdownUrl
      .catch ->
        file.setNone()



`export default VncViewerComponent`
