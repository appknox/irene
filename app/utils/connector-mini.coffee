`import ENV from 'irene/config/environment';`
`import ConnectorMixin from 'irene/mixins/connector';`

BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

getMousePos = (canvas, event) ->
  rect = canvas.getBoundingClientRect()
  {
    x: parseInt event.clientX - rect.left
    y: parseInt event.clientY - rect.top
  }

class ConnectorMini extends ConnectorMixin

  isMouseDown: false

  sendPointer: (activity, mousePos) ->
    cmd = "#{activity} 0"
    if activity isnt 'u'
      cmd = "#{cmd} #{mousePos.x} #{mousePos.y} 50"
    cmd = "#{cmd}\nc\n"
    console.log cmd
    @ws.send JSON.stringify type: "pointer", data: cmd

  connect: ->
    that = @
    canvasEl = @canvasEl
    prefix = "ws"
    if ENV.deviceFarmSsl is true
      prefix += "s"
    endPoint = "#{prefix}://#{ENV.deviceFarmHost}:#{ENV.deviceFarmPort}/websockify?token=#{@deviceToken}"
    ctx2d = canvasEl.getContext '2d'

    canvasEl.addEventListener 'mousedown', (event)->
      that.isMouseDown = true
      mousePos = getMousePos canvasEl, event
      that.sendPointer 'd', mousePos

    canvasEl.addEventListener 'mousemove', (event) ->
      if that.isMouseDown
        mousePos = getMousePos canvasEl, event
        that.sendPointer 'm', mousePos

    canvasEl.addEventListener 'mouseup', (event)->
      that.isMouseDown = false
      that.sendPointer 'u'

    canvasEl.addEventListener 'mouseleave', (event)->
      that.isMouseDown = false
      that.sendPointer 'u'

    @ws = new WebSocket endPoint, 'minicap'
    @ws.binaryType = 'blob'


    @ws.onclose = ->
      console.log 'onclose', arguments

    @ws.onerror = ->
      console.log 'onerror', arguments

    @ws.onmessage = (message) ->
      blob = new Blob [message.data], type: 'image/jpeg'
      URL = window.URL or window.webkitURL
      img = new Image

      img.onload = ->
        canvasEl.width = img.width
        canvasEl.height = img.height
        ctx2d.drawImage img, 0, 0
        img.onload = null
        img.src = BLANK_IMG
        img = null
        u = null
        blob = null

      u = URL.createObjectURL blob
      img.src = u
    token =  @deviceToken
    @ws.onopen = ->
      console.log 'onopen', arguments
      that.ws.send JSON.stringify type: "subscribe", token: token



  disconnect: ->
    @ws.onclose = ->
    @ws.close()

`export default ConnectorMini`
