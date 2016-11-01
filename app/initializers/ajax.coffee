initialize = (application) ->
  application.inject 'route', 'ajax', 'service:ajax'
  application.inject 'component', 'ajax', 'service:ajax'

AjaxInitializer =
  name: 'ajax'
  initialize: initialize

`export {initialize}`
`export default AjaxInitializer`
