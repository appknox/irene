`import Ember from 'ember';`
`import Notify from 'ember-notify';`
`import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';`
`import ENV from 'irene/config/environment';`

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

  authenticator: ENV['simple-auth'].authenticator

  checkOnInit: (->
    if localStorage.authToken
      @transitionToRoute "index"
  ).on "init"

  actions:

    login: ->
      errors = @validate()
      if errors?.length > 0
        Notify.error "#{errors.join " & "} required", closeAfter: 5000
        that = @
      else
        @get('session').authenticate @get('authenticator'),
          identification: @get "identification"
          password: @get "password"

    error: (reason) ->
      Notify.alert reason, closeAfter: 3000

    setCredentials: (username, password)->
      @set "identification", username
      @set "password", password

`export default LoginController;`
