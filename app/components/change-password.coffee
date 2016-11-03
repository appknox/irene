`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

isValidPassword = (password)->
  return password.length > 5

ChangePasswordComponent = Ember.Component.extend


  passwordCurrent: ""
  passwordNew: ""
  passwordConfirm: ""

  actions:
    changePassword: ->
      passwordCurrent = @get "passwordCurrent"
      passwordNew = @get "passwordNew"
      passwordConfirm = @get "passwordConfirm"
      for password in [passwordCurrent, passwordNew, passwordConfirm]
        return @get("notify").error("Please enter valid passwords!") if !isValidPassword password
      if passwordNew isnt passwordConfirm
        return @get("notify").error "passwords did not match"

      data =
        password: passwordCurrent
        newPassword: passwordNew
      that = @
      ajax = @get "ajax"
      ajax.post ENV.endpoints.changePassword, data: data
      .then ->
        that.get("notify").success "Your password has been changed."
      .catch (xhr, message, status) ->
        debugger
        that.get("notify").error xhr.message

`export default ChangePasswordComponent`
