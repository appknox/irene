`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`


updateState = ->
  return true

xvpInit = ->
  return true

ConnectorRFB = Ember.Object.extend

  rfb: null

  constructor: (@canvasEl, @deviceToken) ->
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

  connect: ->
    @rfb.connect ENV.deviceFarmHost, ENV.deviceFarmPort, '1234', "?token=#{@deviceToken}"

  disconnect: ->
    @rfb.disconnect()

`export default ConnectorRFB`
