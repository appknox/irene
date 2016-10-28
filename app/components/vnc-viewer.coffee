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
    if ENUMS.DYNAMIC_STATUS.READY is @get 'file.dynamicStatus'
      @createVNCObject()

  statusChange: ( ->
    if ENUMS.DYNAMIC_STATUS.READY is @get 'file.dynamicStatus'
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
      pricing = @get "file.project.owner.pricing"
      dynamicUrl = [ENV.APP.API_BASE, ENV.endpoints.dynamic, file_id].join '/'
      $.get dynamicUrl

    dynamicShutdown: ->
      file_id = @get "file.id"
      shutdownUrl = [ENV.APP.API_BASE, ENV.endpoints.dynamicShutdown, file_id].join '/'
      $.get shutdownUrl

`export default VncViewerComponent`

