`import Ember from 'ember'`

LoginComponentComponent = Ember.Component.extend
  session: Ember.inject.service 'session'
  actions:
    authenticate: ->
      that = @
      identification = @get 'identification'
      password = @get 'password'
      @get('session').authenticate("authenticator:irene", identification, password).catch (reason) ->
        that.get("notify").error "Invalid Account Details", {
          autoClear: true,
          clearDuration: 4000
        }


`export default LoginComponentComponent`
