`import Ember from 'ember';`

`import ENV from 'irene/config/environment';`


PasswordRecoverComponent = Ember.Component.extend
  username: ""

  validation_errors: []

  validate: ->
    @validation_errors = []
    username = @get "username"
    if username.length < 5
      return @validation_errors.push "Please enter a valid username"
    else
      @validation_errors = []
    @validation_errors

  actions:

    recover: ->
      @validate()
      if @validation_errors.length > 0
        return @get("notify").error "#{@validation_errors.join " & "}", closeAfter: 5000
      username = @get "username"
      recoverUrl = [ENV.APP.API_BASE, ENV.endpoints.recover].join '/'
      that = @
      data =
        username: username
      Ember.$.post recoverUrl, data
      .then (data, status, xhr)->
        that.get("notify").success data.message, closeAfter: 7000
      .fail (xhr, message, status) ->
        that.get("notify").error xhr.responseJSON.message

`export default PasswordRecoverComponent`
