`import ENV from 'irene/config/environment';`

connectorRFB = (canvasEl) ->
  updateState = ->
    return true

  xvpInit = ->
    return true

  new RFB
    'target': canvasEl
    'encrypt': ENV.deviceFarmSsl
    'repeaterID': ''
    'true_color': true
    'local_cursor': true
    'shared': true
    'view_only': false
    'onUpdateState': updateState
    'onXvpInit': xvpInit

`export default connectorRFB`
