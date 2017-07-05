`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`

vncHeight = 512
vncWidth = 385

hasApiFilter = (url)->
  return !Ember.isEmpty url

isRegexFailed = (url) ->
  reg = /http|www/
  res = reg.test(url)

isAllowedCharacters = (url) ->
  reg = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
  res = reg.test(url)

VncViewerComponent = Ember.Component.extend
  onboard: Ember.inject.service()
  rfb: null
  file: null
  isPoppedOut: false
  classNameBindings: ["isPoppedOut:modal", "isPoppedOut:is-active"]
  showURLFilter: false
  showAPIScan: true

  vncPopText: (->
    if @get "isPoppedOut"
      "Close Modal"
    else
      "Pop Out Modal"
  ).property "isPoppedOut"

  didInsertElement: ->
    canvasEl = @element.getElementsByClassName("canvas")[0]
    that = @
    @set "rfb", new RFB
      'target': canvasEl
      'encrypt': ENV.deviceFarmSsl
      'repeaterID': ''
      'true_color': true
      'local_cursor': false
      'shared': true
      'view_only': false

      'onUpdateState': ->
        if ENUMS.PLATFORM.IOS isnt that.get "file.project.platform"
          # Only resize iOS Devices
          return true
        display = @get_display()
        scaleRatio = display.autoscale vncHeight, vncWidth  # TODO: This needs to be set Dynamically
        @get_mouse().set_scale scaleRatio
        true

      'onXvpInit': ->
        true

    if @get 'file.isReady'
      @send("connect")

  statusChange: ( ->
    if @get 'file.isReady'
      @send("connect")
    else
      @send "disconnect"
  ).observes 'file.dynamicStatus'

  actions:
    togglePop: ->
      @set "isPoppedOut", !@get "isPoppedOut"

    connect: ->
      rfb = @get "rfb"
      deviceToken = @get "file.deviceToken"
      rfb.connect ENV.deviceFarmHost, ENV.deviceFarmPort, '1234', "#{ENV.deviceFarmPath}?token=#{deviceToken}"

    disconnect: ->
      rfb = @get "rfb"
      if rfb._rfb_connection_state is 'connected'
        rfb.disconnect()

    dynamicScan: ->
      file = @get "file"
      file.setBootingStatus()
      file_id = @get "file.id"
      dynamicUrl = [ENV.endpoints.dynamic, file_id].join '/'
      @get("ajax").request dynamicUrl
      .catch (error) ->
        file.setNone()
        for error in error.errors
          that.get("notify").error error.detail?.message

    doNotRunAPIScan: ->
      @set "isApiScanEnabled", false
      @send "isApiScanEnabled"
      @send "closeModal"

    showURLFilter: ->
      @set "showURLFilter", true
      @set "showAPIScan", false

    isApiScanEnabled: ->
      isApiScanEnabled = @get "isApiScanEnabled"
      project_id = @get "file.project.id"
      apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, project_id].join '/'
      that = @
      data =
        isApiScanEnabled: isApiScanEnabled
      @get("ajax").post apiScanOptions, data: data
      .then (data)->
        that.send "dynamicScan"
        that.get("notify").success "Starting the scan"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    dynamicShutdown: ->
      file = @get "file"
      file.setShuttingDown()
      @set "isPoppedOut", false
      file_id = @get "file.id"
      shutdownUrl = [ENV.endpoints.dynamicShutdown, file_id].join '/'
      @get("ajax").request shutdownUrl
      .catch (error) ->
        file.setNone()
        for error in error.errors
          that.get("notify").error error.detail?.message

    addNewUrl: ->
      @$('#newInputBox').append('<div><input type="text" class="form-control input margin-top" placeholder="Enter API endpoint"/><i class="fa risk-icons fa-trash-o removeUrl position-icons"></i><br/></div>')
      @$(".removeUrl").click ->
        urlFilter = this.previousElementSibling.value
        if !Ember.isEmpty urlFilter
          return if !confirm "Do you want to remove #{urlFilter} from url filters?"
        $(this).parent().remove()

    removeUrl: ->
      urlFilter = event.target.previousElementSibling.value
      if !Ember.isEmpty urlFilter
        return if !confirm "Do you want to remove #{urlFilter} from url filters?"
      event.target.parentElement.remove()

    openAPIScanModal: ->
      platform = @get "file.project.platform"
      if platform in [ENUMS.PLATFORM.ANDROID,ENUMS.PLATFORM.IOS] # TEMPIOSDYKEY
        @set "showURLFilter", false
        @set "showAPIScan", true
        @set "showAPIScanModal", true
      else
        @send "doNotRunAPIScan"

    closeModal: ->
      @set "showAPIScanModal", false

    addUrlFilterAndStartScan: (callback)->
      form = @$('.input')
      urls = ""
      that = @
      params = jQuery.makeArray(form)
      params.forEach (param) ->
        url = param.value
        if !hasApiFilter url
          callback(that.get("notify").error "Please enter any url filter")
        if isRegexFailed url
          callback(that.get("notify").error "Please enter a valid url filter")
        if !isAllowedCharacters url
          callback(that.get("notify").error "Special Characters not allowed")
        urls = that.get "urls"
        if Ember.isEmpty urls
          urls = url
        else
          urls = [urls, url].join ','
        that.set "urls", urls
      @set "isApiScanEnabled", true
      if !hasApiFilter urls
        return @get("notify").error "Please enter any url filter"
      isApiScanEnabled = @get "isApiScanEnabled"
      project_id = @get "file.project.id"
      apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, project_id].join '/'
      data =
        apiUrlFilters: urls
        isApiScanEnabled: isApiScanEnabled
      @get("ajax").post apiScanOptions, data: data
      .then (data)->
        that.send "closeModal"
        that.send "dynamicScan"
        that.set "urls", ""
        that.get("notify").success "Successfully added the url filter & Starting the scan"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default VncViewerComponent`
