`import Ember from 'ember';`

`import ENV from 'irene/config/environment';`


PasswordRecoverComponent = Ember.Component.extend
  identification: ""

  actions:

    recover: ->
      identification = @get "identification"
      that = @
      data =
        identification: identification
      @get("ajax").post ENV.endpoints.recover, data: data
      .then (data)->
        that.get("notify").success data.message
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default PasswordRecoverComponent`
