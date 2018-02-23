`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';`
`import surveyMonkey from 'irene/utils/survey-monkey';`
`import ENV from 'irene/config/environment';`
`import ENUMS from 'irene/enums'`
`import config from 'irene/config/environment';`
`import { CSBMap } from 'irene/router'`
`import triggerAnalytics from 'irene/utils/trigger-analytics'`

location = window.location

{inject: {service}, isEmpty, RSVP} = Ember

AuthenticatedRoute = Ember.Route.extend AuthenticatedRouteMixin,

  lastTransition: null
  i18n: service()
  moment: service()
  session: service()
  realtime: service()
  mixpanel: service()
  trial: service()
  socketIOService: service 'socket-io'

  beforeModel: (transition)->
    @set "lastTransition", transition
    @_super transition

  model: ->
    userId = @get "session.data.authenticated.user_id"
    @get('store').find('user', userId)

  afterModel: (user, transition)->
    data =
      userId: user.get "email"
      accountId: user.get("email").split("@").pop().trim();
    triggerAnalytics('login', data)
    try
      window.Intercom "boot",
        app_id: ENV.intercomAppID
        name: user.get "username"
        email: user.get "email"
        alignment: 'left'
        horizontal_padding: 20
        vertical_padding: 20
        custom_launcher_selector: '#intercom_support'
        user_hash: user.get "intercomHash"
      window.Intercom 'trackEvent', 'logged-in'
    try
      mixpanel = @get "mixpanel"
      mixpanel.identify user.get "id"
      mixpanel.peopleSet
        "$name": user.get "username"
        "$email": user.get "email"
    try
      pendo.initialize
        visitor:
          id: user.get("id")
          email: user.get "email"
        account:
          id: user.get("email").split("@").pop().trim();

    catch error

    trial = @get "trial"
    trial.set "isTrial", user.get "isTrial"

    @get('notify').setDefaultAutoClear ENV.notifications.autoClear

    socketId = user?.get "socketId"
    if Ember.isEmpty socketId
      return
    @set 'i18n.locale', user.get "lang"
    @get('moment').changeLocale user.get "lang"

    that = @
    store = @get "store"
    realtime = @get "realtime"

    allEvents =

      object: (data) ->
        store.pushPayload data: data

      newobject: (data) ->
        store.pushPayload data: data
        if data.type is "files"
          fileId = data.id
          that.get("notify").info "New scan started <a class='click-here' href='/file/#{fileId} onclick='return false;'>Show</a>", htmlContent: true, autoClear: false

      message: (data) ->
        message = data.message
        notifyType = data.notifyType
        that.get("notify").info message, ENV.notifications if notifyType is ENUMS.NOTIFY.INFO
        that.get("notify").success message, ENV.notifications if notifyType is ENUMS.NOTIFY.SUCCESS
        that.get("notify").warning message, ENV.notifications if notifyType is ENUMS.NOTIFY.WARNING
        that.get("notify").alert message, ENV.notifications if notifyType is ENUMS.NOTIFY.ALERT
        that.get("notify").error message, ENV.notifications if notifyType is ENUMS.NOTIFY.ERROR

      logout: ->
        localStorage.clear()
        location.reload()

      reload: ->
        location.reload()

      counter: (data) ->
        realtime.incrementProperty "#{data.type}Counter"

      namespace: (data) ->
        realtime.set "namespace", data.namespace

    socket = @get('socketIOService').socketFor ENV.socketPath

    socket.emit "subscribe", room: socketId
    for key, value of allEvents
      socket.on key, value

  actions:

    willTransition: (transition) ->
      currentRoute = transition.targetName
      csbDict = CSBMap[currentRoute]
      if !Ember.isEmpty csbDict
        triggerAnalytics('feature', csbDict)

    invalidateSession: ->
      triggerAnalytics('logout')
      @get('session').invalidate()

    giveFeeback: ->
      surveyMonkey()

`export default AuthenticatedRoute`
