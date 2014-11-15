`import IreneAuthenticator from '../authenticators/irene';`
`import IreneAuthorizer from '../authorizers/irene';`
`import IreneSession from '../sessions/irene';`


initialize = (container, application) ->
  container.register 'authenticator:irene', IreneAuthenticator
  container.register 'authorizer:irene', IreneAuthorizer
  container.register 'session:irene', IreneSession

AuthInitializer =
  name: 'auth'
  before: 'simple-auth'
  initialize: initialize

`export {initialize};`
`export default AuthInitializer;`
