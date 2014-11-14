`import IreneAuthenticator from '../authenticators/irene';`
`import IreneAuthorizer from '../authorizers/irene';`


initialize = (container, application) ->
  container.register 'authenticator:irene', IreneAuthenticator
  container.register 'authorizer:irene', IreneAuthorizer

AuthInitializer =
  name: 'auth'
  before: 'simple-auth'
  initialize: initialize

`export {initialize}`
`export default AuthInitializer`
