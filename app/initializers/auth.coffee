`import IreneSession from '../sessions/irene';`
`import IreneAuthenticator from '../authenticators/irene';`
`import IreneAuthorizer from '../authorizers/irene';`


initialize = (container, application) ->
  container.register 'session:irene', IreneSession
  container.register 'authorizer:irene', IreneAuthorizer
  container.register 'authenticator:irene', IreneAuthenticator

AuthInitializer =
  name: 'auth'
  before: 'simple-auth'
  initialize: initialize

`export {initialize};`
`export default AuthInitializer;`
