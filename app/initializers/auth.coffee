`import IreneSession from 'irene/sessions/irene';`
`import IreneAuthenticator from 'irene/authenticators/irene';`
`import IreneAuthorizer from 'irene/authorizers/irene';`
`import ENV from 'irene/config/environment';`


initialize = (container, application) ->
  container.register ENV['simple-auth'].session, IreneSession
  container.register ENV['simple-auth'].authorizer, IreneAuthorizer
  container.register ENV['simple-auth'].authenticator, IreneAuthenticator

AuthInitializer =
  name: 'auth'
  before: 'simple-auth'
  initialize: initialize

`export {initialize};`
`export default AuthInitializer;`
