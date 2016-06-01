`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`

installRaven = ->
  console.log "Installing Raven"
  if ENV.environment is "production"
    # Raven - Ember Plugin
    _oldOnError = Ember.onerror

    Ember.onerror  = (error) ->
      Raven.captureException error
      if 'function' is typeof _oldOnError
        _oldOnError.call @, error

    _notifyShow = Notify.show

    Notify.show = (type, message, options) ->
      _notifyShow.call @, type, message, options
      Raven.captureMessage message if type is "error"

    Ember.RSVP.on 'error', (err) ->
      Raven.captureException err

    Ember.RSVP.on 'fulfilled', ->
      Raven.captureMessage "RSVP Fulfilled!", "level": "info"

    Ember.RSVP.on 'rejected', ->
      Raven.captureMessage "RSVP Rejected!", "level": "info"

    rvn = Raven.config ENV.ravenDSN,
      release: ENV.currentRevision

    rvn.install()
  else
    window.Raven =
      setUserContext: ->
        console.log "Raven.setUserContext"
        console.log arguments

      captureMessage: ->
        console.log "Raven.captureMessage"
        console.log arguments

      captureException: (exception)->
        # debugger
        console.log "Raven.captureException"
        console.error exception.stack

      config: ->
        console.log "Raven.config"
        console.log arguments

        install: ->
          console.log "Raven.install"
          console.log arguments

`export default installRaven`
