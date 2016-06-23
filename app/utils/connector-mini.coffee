`import ENV from 'irene/config/environment';`
`import ConnectorMixin from 'irene/mixins/connector';`

BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='


class ConnectorMini extends ConnectorMixin

  connect: ->
    canvasEl = @canvasEl
    prefix = "ws"
    if ENV.deviceFarmSsl is true
      prefix += "s"
    endPoint = "#{prefix}://#{ENV.deviceFarmHost}:#{ENV.deviceFarmPort}/websockify?token=#{@deviceToken}"
    debugger
    ctx2d = canvasEl.getContext '2d'
    @ws = new WebSocket endPoint, 'minicap'
    @ws.binaryType = 'blob'

    @ws.onclose = ->
      console.log 'onclose', arguments

    @ws.onerror = ->
      console.log 'onerror', arguments

    @ws.onmessage = (message) ->
      blob = new Blob([ message.data ], type: 'image/jpeg')
      URL = window.URL or window.webkitURL
      img = new Image

      img.onload = ->
        console.log img.width, img.height
        canvasEl.width = img.width
        canvasEl.height = img.height
        ctx2d.drawImage img, 0, 0
        img.onload = null
        img.src = BLANK_IMG
        img = null
        u = null
        blob = null

      u = URL.createObjectURL(blob)
      img.src = u

    @ws.onopen = ->
      console.log 'onopen', arguments
      @ws.send '1920x1080/0'


  disconnect: ->
    @ws.onclose = ->
    @ws.close()

`export default ConnectorMini`
