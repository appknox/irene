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
        that.get("notify").error "Invalid Account Details", ENV.notifications


`export default LoginComponentComponent`
