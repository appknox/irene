`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`
`import ConnectorRFB from 'irene/utils/connector-rfb';`

VncViewerComponent = Ember.Component.extend
  file: null

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

    connect: ->
      @connector.connect()

    disconnect: ->
      @connector.disconnect()
      delete @connector

    dynamicScan: ->
      file_id = @get "file.id"
      dynamicUrl = [ENV.endpoints.dynamic, file_id].join '/'
      @get("ajax").request dynamicUrl

    dynamicShutdown: ->
      file_id = @get "file.id"
      shutdownUrl = [ENV.endpoints.dynamicShutdown, file_id].join '/'
      @get("ajax").request shutdownUrl

`export default VncViewerComponent`

