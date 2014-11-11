`import config from '../config/environment';`
# Takes two parameters: container and app
initialize = () ->
  # app.register 'route', 'foo', 'service:foo'

AuthInitializer =
  name: 'auth',
  before: 'django-rest-auth',
  initialize: (container, application) =>
    window.ENV = config

`export {initialize}`
`export default AuthInitializer`
