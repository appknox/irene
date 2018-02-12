`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import {isUnauthorizedError} from 'ember-ajax/errors'`

LoginComponentComponent = Ember.Component.extend
  session: Ember.inject.service 'session'
  MFAEnabled: false
  actions:
    authenticate: ->
      that = @
      identification = @get 'identification'
      password = @get 'password'
      otp = @get "otp"

      if !identification or !password
        return that.get("notify").error "Please enter username and password", ENV.notifications
      identification = identification.trim()
      password = password.trim()

      errorCallback = (error)->
        if isUnauthorizedError(error)
          that.set "MFAEnabled", true


      @get('session').authenticate("authenticator:irene", identification, password, otp, errorCallback)

`export default LoginComponentComponent`
