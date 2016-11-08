`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

isValidPassword = (password)->
  return password.length > 5



ChangePasswordComponent = Ember.Component.extend
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
        that.get("notify").success tPasswordChanged
      .catch (xhr, message, status) ->
        debugger
        that.get("notify").error xhr.message

`export default ChangePasswordComponent`
