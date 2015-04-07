`import Ember from 'ember';`
`import Notify from 'ember-notify';`
`import ENV from 'irene/config/environment';`


ResetController = Ember.Controller.extend
  uuid: ""
  token: ""
  password: ""
  confirmPassword: ""

  validation_errors: []

  validate: ->
    password = @get "password"
    if password.length < 6
      return @validation_errors.push "Passwords must be greater than or equal to 6"
    confirmPassword = @get "confirmPassword"
    if password is confirmPassword
      @validation_errors = []
    else
      @validation_errors.push "Passwords doesnt match"
    @validation_errors

  actions:

    reset: ->
      @validate()
      if @validation_errors.length > 0
        return Notify.error "#{@validation_errors.join " & "}", closeAfter: 5000
      password = @get "password"
      uuid = @get "uuid"
      token = @get "token"
      resetUrl = [ENV.APP.API_BASE, ENV.endpoints.reset].join '/'
      that = @
      data =
        uuid: uuid
        token: token
        password: password
      Ember.$.post resetUrl, data
      .then ->
        that.transitionTo "login"
        Notify.success "Pasword is successfully reset!"
      .fail (xhr, message, status) ->
        Notify.error xhr.responseJSON.message

`export default ResetController;`

