initialize = (application) ->
  application.inject 'component', 'store', 'service:store'

InjectEnvInitializer =
  name: 'inject-store'
  initialize: initialize

`export {initialize}`
`export default InjectEnvInitializer`
