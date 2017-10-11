`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

isValidPassword = (password)->
  return password.length > 5

PasswordChangeComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  passwordCurrent: ""
  passwordNew: ""
  passwordConfirm: ""
  tEnterValidPassword: t("enterValidPassword")
  tInvalidPassword: t("invalidPassword")
  tPasswordChanged: t("passwordChanged")
  actions:
    changePassword: ->
      tEnterValidPassword = @get "tEnterValidPassword"
      tInvalidPassword = @get "tInvalidPassword"
      tPasswordChanged = @get "tPasswordChanged"
      passwordCurrent = @get "passwordCurrent"
      passwordNew = @get "passwordNew"
      passwordConfirm = @get "passwordConfirm"
      for password in [passwordCurrent, passwordNew, passwordConfirm]
        return @get("notify").error tEnterValidPassword if !isValidPassword password
      if passwordNew isnt passwordConfirm
        return @get("notify").error tInvalidPassword
      data =
        password: passwordCurrent
        newPassword: passwordNew
      that = @
      ajax = @get "ajax"
      ajax.post ENV.endpoints.changePassword, data: data
      .then ->
        that.setProperties({
          passwordCurrent: ""
          passwordNew: ""
          passwordConfirm: ""
          })
        that.get("notify").success tPasswordChanged
        analytics.feature(ENV.csb.feature.changePassword, ENV.csb.module.setup, ENV.csb.product.appknox)
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default PasswordChangeComponent`
