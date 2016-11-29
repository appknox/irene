`import ENV from 'irene/config/environment'`

initialize = (application) ->
  if ENV.environment is 'test'
    # FIXME: Fix this test properly
    return
  application.register 'env:main', ENV, {singleton: true, instantiate: false}
  application.inject 'component', 'env', 'env:main'

InjectEnvInitializer =
  name: 'inject-env'
  initialize: initialize

`export {initialize}`
`export default InjectEnvInitializer`
