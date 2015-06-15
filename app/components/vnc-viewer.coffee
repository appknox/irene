`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`

VncViewerComponent = Ember.Component.extend
  file: null
  classNames: ["m-t"]
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

    @send("connect") if ENUMS.DYNAMIC_STATUS.READY is @get 'file.dynamicStatus'

  statusChange: ( ->
    if ENUMS.DYNAMIC_STATUS.READY is @get 'file.dynamicStatus'
      @send "connect"
    else
      @send "disconnect"
  ).observes 'file.dynamicStatus'

  actions:

    connect: ->
      @rfb.connect ENV.socketHost, ENV.socketPort, '1234', "websockify?token=#{@get 'file.uuid'}"

    disconnect: ->
      @rfb.disconnect()

    dynamicScan: ->
      file_id = @get "file.id"
      pricing = @get "file.project.owner.pricing"
      if Ember.isEmpty pricing
        return @container.lookup("controller:application").get("upgradePlan").send "showModal"
      uploadUrl = [ENV.APP.API_BASE, ENV.endpoints.dynamic, file_id].join '/'
      $.get uploadUrl

    dynamicShutdown: ->
      file_id = @get "file.id"
      uploadUrl = [ENV.APP.API_BASE, ENV.endpoints.dynamicShutdown, file_id].join '/'
      $.get uploadUrl

`export default VncViewerComponent`
