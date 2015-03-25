`import Ember from 'ember';`
`import Notify from 'ember-notify';`
`import ENV from 'irene/config/environment';`

ResetController = Ember.Controller.extend
  username: ""

  validation_errors: []

  validate: ->
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
        return Notify.error "#{@validation_errors.join " & "}", closeAfter: 5000
      username = @get "username"
      recoverUrl = [ENV.APP.API_BASE, ENV.endpoints.recover].join '/'
      that = @
      data =
        username: username
      Ember.$.post recoverUrl, data
        .then (data, status, xhr)->
          Notify.success data.message, closeAfter: 7000
        .fail (xhr, message, status) ->
          Notify.error xhr.responseJSON.message

`export default ResetController;`

