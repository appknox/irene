`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`
`import ConnectorRFB from 'irene/utils/connector-rfb';`
`import ConnectorMini from 'irene/utils/connector-mini';`

VncViewerComponent = Ember.Component.extend
  file: null
  classNames: ["m-t"]
  classNameBindings: ["showAsModal:vnc-modal"]
  showAsModal: false

  createVNCObject: ->
    canvasEl = @element.getElementsByClassName("canvas")[0]
    deviceToken = @get 'file.deviceToken'
    switch @get "file.project.platform"
      when ENUMS.PLATFORM.ANDROID then @connector = new ConnectorMini canvasEl, deviceToken
      when ENUMS.PLATFORM.IOS then @connector = new ConnectorRFB canvasEl, deviceToken
      else
        throw "Not Implemented"
    @send("connect")

  didInsertElement: ->
    if ENUMS.DYNAMIC_STATUS.READY is @get 'file.dynamicStatus'
      @createVNCObject()

  statusChange: ( ->
    if ENUMS.DYNAMIC_STATUS.READY is @get 'file.dynamicStatus'
      @createVNCObject()
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
      @connector.connect()

    disconnect: ->
      @connector.disconnect()
      delete @connector

    dynamicScan: ->
      file_id = @get "file.id"
      pricing = @get "file.project.owner.pricing"
      # if Ember.isEmpty pricing
      #   return @container.lookup("controller:application").get("upgradePlanModal").send "showModal"
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
