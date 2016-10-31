`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
# `import Notify from 'ember-notify';`

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
        return Notify.error("Please enter valid passwords!") if !isValidPassword password
      if passwordNew isnt passwordConfirm
        return Notify.error "passwords did not match"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.changePassword].join '/'
      data =
        password: passwordCurrent
        newPassword: passwordNew
      that = @
      Ember.$.post postUrl, data
      .then ->
        Notify.success "Your password has been changed."
      .fail (xhr, message, status) ->
        Notify.error xhr.responseJSON.message

`export default ChangePasswordComponent`
