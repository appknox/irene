`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`
`import connectorRFB from 'irene/utils/connector-rfb';`

VncViewerComponent = Ember.Component.extend
  file: null
  classNames: ["m-t"]
  classNameBindings: ["showAsModal:vnc-modal"]
  vncConnector: null
  showAsModal: false

  didInsertElement: ->
    thisEl = document.getElementById @elementId
    canvasEl = thisEl.getElementsByTagName("canvas")[0]
    @vncConnector = connectorRFB canvasEl
    @send("connect") if ENUMS.DYNAMIC_STATUS.READY is @get 'file.dynamicStatus'

  statusChange: ( ->
    if ENUMS.DYNAMIC_STATUS.READY is @get 'file.dynamicStatus'
      @send "connect"
    else
      @set "showAsModal", false
      @send "disconnect"
  ).observes 'file.dynamicStatus'

  switchText: (->
    if @get "showAsModal"
      "Back to side-view"
    else
      "Pop out as modal"
  ).property "showAsModal"

  actions:

    connect: ->
      @vncConnector.connect ENV.deviceFarmHost, ENV.deviceFarmPort, '1234', "websockify?token=#{@get 'file.deviceToken'}"

    disconnect: ->
      @vncConnector.disconnect()

    dynamicScan: ->
      file_id = @get "file.id"
      pricing = @get "file.project.owner.pricing"
      if Ember.isEmpty pricing
        return @container.lookup("controller:application").get("upgradePlanModal").send "showModal"
      dynamicUrl = [ENV.APP.API_BASE, ENV.endpoints.dynamic, file_id].join '/'
      $.get dynamicUrl

    dynamicShutdown: ->
      @set "showAsModal", false
      file_id = @get "file.id"
      shutdownUrl = [ENV.APP.API_BASE, ENV.endpoints.dynamicShutdown, file_id].join '/'
      $.get shutdownUrl

    switchModal: ->
      @set "showAsModal", !@get "showAsModal"

`export default VncViewerComponent`
