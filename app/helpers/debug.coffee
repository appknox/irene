`import Ember from 'ember'`

debug = (value) ->
  console.log value
  debugger
  value

DebugHelper = Ember.Handlebars.makeBoundHelper debug

`export { debug }`

`export default DebugHelper`
