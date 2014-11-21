`import Ember from 'ember';`
`import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';`
`import Notify from 'ember-notify';`

LoginController = Ember.Controller.extend LoginControllerMixin,

  validation_errors: []

  validate: ->
    @validation_errors = []
    username = @get "identification"
    password = @get "password"
    if !username
      @validation_errors.push "Username"
    if !password
      @validation_errors.push "Password"
    @validation_errors

  authenticator: 'authenticator:irene'

  login: ->
    errors = @validate()
    if errors?.length > 0
      Notify.error "#{errors.join " & "} required", closeAfter: 5000
      that = @
    else
      @send "authenticate"

  actions:
    error: (reason) ->
      Notify.alert reason, closeAfter: 3000

    setCredentials: (username, password)->
      @set "identification", username
      @set "password", password

`export default LoginController;`
