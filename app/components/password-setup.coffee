`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

PasswordSetupComponent = Ember.Component.extend

  uuid: ""
  token: ""
  password: ""
  confirmPassword: ""

  isSettingPassword: false

  validation_errors: []

  validate: ->
    @validation_errors = []
    password = @get "password"

    if password.length < 6
      @validation_errors.push "Password length must be greater than or equal to 6"
      return
    confirmPassword = @get "confirmPassword"
    if password isnt confirmPassword
      @validation_errors.push "Passwords doesn't match"
    @validation_errors

  actions:

    setup: ->
      @validate()
      that = @
      if @validation_errors.length > 0
        return that.get("notify").error "#{@validation_errors.join " & "}"
      password = @get "password"
      uuid = @get "uuid"
      token = @get "token"
      data =
        uuid: uuid
        token: token
        password: password
      @set "isSettingPassword", true
      @get("ajax").post ENV.endpoints.setup, data: data
      .then (data)->
        that.set "isSettingPassword", false
        that.container.lookup("route:setup").transitionTo "login"
        that.get("notify").success "Password is successfully set"
      .catch (error) ->
        that.set "isSettingPassword", false
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default PasswordSetupComponent`
