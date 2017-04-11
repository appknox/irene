`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

LoginComponentComponent = Ember.Component.extend
  session: Ember.inject.service 'session'
  actions:
    authenticate: ->
      that = @
      identification = @get('identification').trim()
      password = @get 'password'

      @get('session').authenticate("authenticator:irene", identification, password).catch (reason) ->
        if !reason
          return that.get("notify").error "Unable to reach server. Please try after sometime.", ENV.notifications
        return that.get("notify").error "Please enter valid account details.", ENV.notifications

`export default LoginComponentComponent`
