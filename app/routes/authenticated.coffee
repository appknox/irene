`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';`
`import ENV from 'irene/config/environment';`
`import ENUMS from 'irene/enums'`

location = window.location

{inject: {service}, isEmpty, RSVP} = Ember

pusher = new Pusher ENV.pusherKey, encrypted: true

AuthenticatedRoute = Ember.Route.extend AuthenticatedRouteMixin,

  lastTransition: null
  i18n: service()
  moment: service()
  session: service 'session'

  beforeModel: (transition)->
    @set "lastTransition", transition
    @_super transition

  model: ->
    userId = @get "session.data.authenticated.user_id"
    @get('store').find('user', userId)

  afterModel: (user, transition)->
    try
      window.Intercom "boot",
        app_id: ENV.intercomAppID
        name: user.get "username"
        email: user.get "email"
      window.Intercom 'trackEvent', 'logged-in'

    @get('notify').setDefaultAutoClear ENV.notifications.autoClear
    @get('notify').setDefaultClearNotification ENV.notifications.duration

    socketId = user?.get "socketId"
    if Ember.isEmpty socketId
      return
    @set 'i18n.locale', user.get "lang"
    @get('moment').changeLocale user.get "lang"
    channel = pusher.subscribe "#{socketId}-2"
    that = @
    store = @get "store"

    allEvents =

      object_event: (data) ->
        # A generic event
        store.pushPayload data: data

      analysis_updated: (data)->
        store.pushPayload data: data
        analysis = store.peekRecord("analysis", data.id)
        risk = analysis.get("risk")
        store.find("vulnerability", analysis.get("vulnerability.id")).then (vulnerability)->
          message = "Analysis Updated: #{vulnerability.get "name"}"
          that.get("notify").info message if risk is ENUMS.RISK.LOW
          that.get("notify").success message if risk is ENUMS.RISK.NONE
          that.get("notify").warning message if risk is ENUMS.RISK.MEDIUM
          that.get("notify").error message if risk is ENUMS.RISK.HIGH

      file_new: (data)->
        that.get("notify").info "New file added"
        file = store.pushPayload data: data

      file_updated: (data) ->
        that.get("notify").info "File updated"
        store.pushPayload data: data

      project_new: (data) ->
        that.get("notify").info "New project added"
        store.pushPayload data: data

      project_updated: (data) ->
        that.get("notify").info "Project `#{data.name}` updated"
        store.pushPayload data: data

      collaboration_deleted: (data) ->
        store.find('collaboration', data.id).then (collaboration) ->
          collaboration.deleteRecord()

      message: (data) ->
        message = data.message
        notifyType = data.notifyType
        that.get("notify").info message if notifyType is ENUMS.NOTIFY.INFO
        that.get("notify").success message if notifyType is ENUMS.NOTIFY.SUCCESS
        that.get("notify").warning message if notifyType is ENUMS.NOTIFY.WARNING
        that.get("notify").alert message if notifyType is ENUMS.NOTIFY.ALERT
        that.get("notify").error message if notifyType is ENUMS.NOTIFY.ERROR


      logout: ->
        localStorage.clear()
        location.reload()

      reload: ->
        location.reload()

    simplePushEvents = [
      "analysis_new", "user_updated", "project_new", "project_updated",
      "submission_new", "submission_updated", "collaboration_new",
      "collaboration_updated"]

    for simplePushEvent in simplePushEvents
      allEvents[simplePushEvent] = allEvents.object_event

    for k, v of allEvents
      channel.bind k, v


  actions:
    invalidateSession: ->
      @get('session').invalidate()

`export default AuthenticatedRoute`
