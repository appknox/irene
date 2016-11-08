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
  enterValidPassword: t("enterValidPassword")
  invalidPassword: t("invalidPassword")
  passwordChanged: t("passwordChanged")
  actions:
    changePassword: ->
      enterValidPassword = @get "enterValidPassword"
      validPassword = @get "invalidPassword"
      passwordChanged = @get "passwordChanged"
      passwordCurrent = @get "passwordCurrent"
      passwordNew = @get "passwordNew"
      passwordConfirm = @get "passwordConfirm"
      for password in [passwordCurrent, passwordNew, passwordConfirm]
        return @get("notify").error enterValidPassword if !isValidPassword password
      if passwordNew isnt passwordConfirm
        return @get("notify").error invalidPassword

      data =
        password: passwordCurrent
        newPassword: passwordNew
      that = @
      ajax = @get "ajax"
      ajax.post ENV.endpoints.changePassword, data: data
      .then ->
        that.get("notify").success passwordChanged
      .catch (xhr, message, status) ->
        debugger
        that.get("notify").error xhr.message

`export default ChangePasswordComponent`
