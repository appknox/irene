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
      'local_cursor': true
      'shared': true
      'view_only': false
      'onUpdateState': updateState
      'onXvpInit': xvpInit
    @rfb.connect ENV.deviceFarmHost, ENV.deviceFarmPort, '1234', "websockify?token=#{@deviceToken}"

  disconnect: ->
    @rfb.disconnect()

`export default ConnectorRFB`
