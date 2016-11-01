`import Ember from 'ember'`

LoginComponentComponent = Ember.Component.extend
  session: Ember.inject.service 'session'
  actions:
    authenticate: ->
      identification = @get 'identification'
      password = @get 'password'
      @get('session').authenticate("authenticator:irene", identification, password).catch (reason) ->
        alert reason


`export default LoginComponentComponent`
