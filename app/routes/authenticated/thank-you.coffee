`import Ember from 'ember'`
`import config from 'irene/config/environment'`

AuthenticatedThankYouRoute = Ember.Route.extend

  title: "Payment Successful"  + config.platform

`export default AuthenticatedThankYouRoute`
