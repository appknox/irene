# Takes two parameters: container and app
initialize = (container, app) ->
  # app.register 'route', 'foo', 'service:foo'
  app.inject 'component', 'store', 'service:store'

ComponentStoreInjectorInitializer =
  name: 'component-store-injector'
  initialize: initialize

`export {initialize}`
`export default ComponentStoreInjectorInitializer`
