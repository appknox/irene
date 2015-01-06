`import Ember from 'ember'`

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
      'encrypt': false
      'repeaterID': ''
      'true_color': true
      'local_cursor': true
      'shared': true
      'view_only': false
      'onUpdateState': updateState
      'onXvpInit': xvpInit

  actions:

    connect: ->
      @rfb.connect 'localhost', '6080', '1234', 'websockify'

`export default VncViewerComponent`
