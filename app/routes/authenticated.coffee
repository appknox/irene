`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';`
`import ENV from 'irene/config/environment';`
`import ENUMS from 'irene/enums'`
`import config from 'irene/config/environment';`

location = window.location

{inject: {service}, isEmpty, RSVP} = Ember

pusher = new Pusher ENV.pusherKey, encrypted: true

AuthenticatedRoute = Ember.Route.extend AuthenticatedRouteMixin,

  lastTransition: null
  i18n: service()
  moment: service()
  session: service()
  realtime: service()

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

    socketId = user?.get "socketId"
    if Ember.isEmpty socketId
      return
    @set 'i18n.locale', user.get "lang"
    @get('moment').changeLocale user.get "lang"
    channel = pusher.subscribe socketId
    that = @
    store = @get "store"

    realtime = @get "realtime"

    allEvents =

      object: (data) ->
        store.pushPayload data: data

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

      counter: (data) ->
        console.log "counter", data
        realtime.incrementProperty "#{data.type}Counter"

    for k, v of allEvents
      channel.bind k, v


  actions:
    invalidateSession: ->
      @get('session').invalidate()

`export default AuthenticatedRoute`
