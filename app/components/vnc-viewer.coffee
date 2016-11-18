`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`
`import ConnectorRFB from 'irene/utils/connector-rfb';`

VncViewerComponent = Ember.Component.extend
  file: null
  isPoppedOut: false
  classNameBindings: ["isPoppedOut:modal", "isPoppedOut:is-active"]

  vncPopText: (->
    if @get "isPoppedOut"
      "Close Modal"
    else
      "Pop Out Modal"
  ).property "isPoppedOut"

  createVNCObject: ->
    canvasEl = @element.getElementsByClassName("canvas")[0]
    deviceToken = @get 'file.deviceToken'
    @connector = new ConnectorRFB canvasEl, deviceToken
    @send("connect")

  didInsertElement: ->
    if @get 'file.isReady'
      @createVNCObject()

  statusChange: ( ->
    if @get 'file.isReady'
      @createVNCObject()
    else
      @send "disconnect"
  ).observes 'file.dynamicStatus'

  actions:
    togglePop: ->
      @set "isPoppedOut", !@get "isPoppedOut"

    connect: ->
      @connector.connect()

    disconnect: ->
      @connector?.disconnect?()
      delete @connector

    dynamicScan: ->
      file = @get "file"
      file.setBooting()
      file_id = @get "file.id"
      dynamicUrl = [ENV.endpoints.dynamic, file_id].join '/'
      @get("ajax").request dynamicUrl
      .catch ->
        file.setNone()


    dynamicShutdown: ->
      file = @get "file"
      file.setShuttingDown()
      file_id = @get "file.id"
      shutdownUrl = [ENV.endpoints.dynamicShutdown, file_id].join '/'
      @get("ajax").request shutdownUrl
      .catch ->
        file.setNone()

    showCurrentStatus: ->
      @get("notify").info @get "file.humanizedStatus"


`export default VncViewerComponent`
