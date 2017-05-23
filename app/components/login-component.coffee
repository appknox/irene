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

      if !identification and !password
        that.get("notify").error "Please enter username and password", ENV.notifications
      identification = identification.trim()
      password = password.trim()

      @get('session').authenticate("authenticator:irene", identification, password)

`export default LoginComponentComponent`
