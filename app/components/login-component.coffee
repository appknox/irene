`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

LoginComponentComponent = Ember.Component.extend
  session: Ember.inject.service 'session'
  actions:
    authenticate: ->
      that = @
      identification = @get 'identification'
      password = @get 'password'

      if !identification
        return that.get("notify").error "Please enter username or email address.", ENV.notifications
      identification = identification.trim()
      if !password
        return that.get("notify").error "Please enter password.", ENV.notifications
      password = password.trim()

      @get('session').authenticate("authenticator:irene", identification, password).catch (reason) ->
        if !reason
          return that.get("notify").error "Unable to reach server. Please try after sometime.", ENV.notifications
        return that.get("notify").error "Please enter valid account details.", ENV.notifications

`export default LoginComponentComponent`
