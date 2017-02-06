`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ENV from 'irene/config/environment'`

AuthenticatedPaymentRoute = Ember.Route.extend

  title: "Payment" + config.platform

`export default AuthenticatedPaymentRoute`
