`import Ember from 'ember';`

`import ENV from 'irene/config/environment';`


PasswordRecoverComponent = Ember.Component.extend

  mailSent: false
  identification: ""
  isSendingRecoveryEmail: false

  actions:

    recover: ->
      identification = @get('identification').trim()
      if !identification
        return @get("notify").error "Please enter your Username/Email", ENV.notifications
      that = @
      data =
        identification: identification
      @set "isSendingRecoveryEmail", true
      @get("ajax").post ENV.endpoints.recover, data: data
      .then (data)->
        that.set "mailSent", true
        that.set "isSendingRecoveryEmail", false
        that.get("notify").success data.message
      .catch (error) ->
        that.set "isSendingRecoveryEmail", false
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default PasswordRecoverComponent`
