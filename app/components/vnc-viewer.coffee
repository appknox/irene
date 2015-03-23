`import Ember from 'ember'`
`import ENUMS from '../enums';`
`import ENV from '../config/environment';`

VncViewerComponent = Ember.Component.extend
  file: null
  mainClass: null
  rfb: null
  didInsertElement: ->
    thisEl = document.getElementById @elementId
    canvasEl = thisEl.getElementsByTagName("canvas")[0]
    updateState = ->
      return true
    xvpInit = ->
      return true
    @rfb = new RFB
      'target': canvasEl
      'encrypt': ENV.socketSecure
      'repeaterID': ''
      'true_color': true
      'local_cursor': true
      'shared': true
      'view_only': false
      'onUpdateState': updateState
      'onXvpInit': xvpInit

  statusChange: ( ->
    status = @get 'file.dynamicStatus'
    @send("connect") if status is ENUMS.DYNAMIC_STATUS.READY
    @send("disconnect") if status is not ENUMS.DYNAMIC_STATUS.READY
  ).observes 'file.dynamicStatus'

  actions:

    connect: ->
      @rfb.connect ENV.socketHost, ENV.socketPort, '1234', "websockify?token=#{@get 'file.uuid'}"

    disconnect: ->
      @rfb.disconnect()

    dynamicScan: ->
      file_id = @get "file.id"
      uploadUrl = [ENV.APP.API_HOST, 'api/dynamic', file_id].join '/'
      $.get uploadUrl

    dynamicShutdown: ->
      file_id = @get "file.id"
      uploadUrl = [ENV.APP.API_HOST, 'api/dynamic_shutdown', file_id].join '/'
      $.get uploadUrl

`export default VncViewerComponent`
