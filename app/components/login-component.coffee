`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

LoginComponentComponent = Ember.Component.extend
  session: Ember.inject.service 'session'
  didRender: ->
    script = document.createElement "script"
    script.src = "https://neoeyed-staging.azure-mobile.net/api/button?gate_key=NEG2393940"
    document.body.appendChild(script)
  actions:
    authenticate: ->
      that = @
      identification = @get 'identification'
      password = @get 'password'
      @get('session').authenticate("authenticator:irene", identification, password).catch (reason) ->
        that.get("notify").error "Invalid Account Details", ENV.notifications


`export default LoginComponentComponent`
