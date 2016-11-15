class ConnectorMixin
  constructor: (@canvasEl, @deviceToken) ->

  connect: ->
    throw "Not Implemented Error"

  disconnect: ->
    throw "Not Implemented Error"

`export default ConnectorMixin`
