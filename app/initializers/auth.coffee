`import IreneSession from 'irene/sessions/irene';`
`import IreneAuthenticator from 'irene/authenticators/irene';`
`import IreneAuthorizer from 'irene/authorizers/irene';`


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
