`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

PasswordResetComponent = Ember.Component.extend
  i18n: Ember.inject.service()

  uuid: ""
  token: ""
  password: ""
  confirmPassword: ""

  tPasswordLengthError: t("passwordLengthError")
  tPasswordMatchError: t("passwordMatchError")
  tPasswordIsReset: t("passwordIsReset")

  validation_errors: []

  validate: ->
    @validation_errors = []
    password = @get "password"

    tPasswordLengthError = @get "tPasswordLengthError"
    tPasswordMatchError = @get "tPasswordMatchError"

    if password.length < 6
      @validation_errors.push tPasswordLengthError
      return
    confirmPassword = @get "confirmPassword"
    if password isnt confirmPassword
      @validation_errors.push tPasswordMatchError
    @validation_errors

  actions:

    reset: ->
      tPasswordIsReset = @get "tPasswordIsReset"
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
        that.get("notify").success tPasswordIsReset
      .catch (error) ->
        debugger
        for error in error.errors
          that.get("notify").error error.detail.message

`export default PasswordResetComponent`
