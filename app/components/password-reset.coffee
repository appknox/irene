`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`

PasswordResetComponent = Ember.Component.extend
  uuid: ""
  token: ""
  password: ""
  confirmPassword: ""

  validation_errors: []

  validate: ->
    @validation_errors = []
    password = @get "password"
    if password.length < 6
      @validation_errors.push "Passwords must be greater than or equal to 6"
      return
    confirmPassword = @get "confirmPassword"
    if password isnt confirmPassword
      @validation_errors.push "Passwords doesnt match"
    @validation_errors

  actions:

    reset: ->
      that = @
      @validate()
      if @validation_errors.length > 0
        return that.get("notify").error "#{@validation_errors.join " & "}"
      password = @get "password"
      uuid = @get "uuid"
      token = @get "token"
      data =
        uuid: uuid
        token: token
        password: password
      @get("ajax").post ENV.endpoints.reset, data: data
      .then (data)->
        that.container.lookup("route:reset").transitionTo "login"
        that.get("notify").success "Pasword is successfully reset!"
      .catch (error) ->
        debugger
        for error in error.errors
          that.get("notify").error error.detail.message

`export default PasswordResetComponent`
