`import ENV from 'irene/config/environment';`


updateState = ->
  return true

xvpInit = ->
  return true

class ConnectorRFB

  rfb: null

  constructor: (@canvasEl, @deviceToken) ->

  connect: ->
    @rfb = new RFB
      'target': @canvasEl
      'encrypt': ENV.deviceFarmSsl
      'repeaterID': ''
      'true_color': true
      'local_cursor': false
      'shared': true
      'view_only': false
      'onUpdateState': updateState
      'onXvpInit': xvpInit
    @rfb.connect ENV.deviceFarmHost, ENV.deviceFarmPort, '1234', "#{ENV.deviceFarmPath}?token=#{@deviceToken}"
    display = @rfb.get_display
    display.set_maxWidth ENV.vncScreenWidth
    display.set_maxHeight ENV.vncScreenHeight
    rfb.requestDesktopSize ENV.vncScreenWidth, ENV.vncScreenHeight


  disconnect: ->
    @rfb.disconnect()

`export default ConnectorRFB`
