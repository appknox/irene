`import ENV from 'irene/config/environment';`
`import ConnectorMixin from 'irene/mixins/connector';`


updateState = ->
  return true

xvpInit = ->
  return true

class ConnectorRFB extends ConnectorMixin
  rfb: null

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
    # display.set_maxWidth ENV.vncScreenWidth
    # display.set_maxHeight ENV.vncScreenHeight
    debugger
    @rfb.connect ENV.deviceFarmHost, ENV.deviceFarmPort, '1234', "#{ENV.deviceFarmPath}?token=#{@deviceToken}"
    # display = @rfb.get_display()
    # @rfb.requestDesktopSize ENV.vncScreenWidth, ENV.vncScreenHeight


  disconnect: ->
    @rfb.disconnect()

`export default ConnectorRFB`
