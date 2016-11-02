`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';`
`import ENV from 'irene/config/environment';`
`import ENUMS from 'irene/enums'`

{inject: {service}, isEmpty, RSVP} = Ember

pusher = new Pusher ENV.pusherKey, encrypted: true

AuthenticatedRoute = Ember.Route.extend AuthenticatedRouteMixin,
  session: service 'session'

  model: ->
    userId = @get "session.data.authenticated.user_id"
    @get('store').find('user', userId)

  afterModel: (user, transition)->
    socketId = user?.get "socketId"
    if Ember.isEmpty socketId
      return
    channel = pusher.subscribe "#{socketId}-2"
    that = @
    store = @get "store"
    allEvents =
      analysis_new: (data)->
        store.pushPayload data: data

      analysis_updated: (data)->
        risk = data.risk
        analysis = store.pushPayload data: data
        store.find("vulnerability", analysis.get("vulnerabilityId")).then (vulnerability)->
          message = "Analysis Updated: #{vulnerability.get "name"}"
          that.get("notify").info message if risk is ENUMS.RISK.LOW
          that.get("notify").success message if risk is ENUMS.RISK.NONE
          that.get("notify").warning message if risk is ENUMS.RISK.MEDIUM
          that.get("notify").error message if risk is ENUMS.RISK.HIGH


      file_new: (data)->
        that.get("notify").info "New file added"
        file = store.pushPayload data: data
        project.set "lastFile", file

      file_updated: (data) ->
        that.get("notify").info "File updated"
        store.pushPayload data: data

      user_updated: (data) ->
        store.pushPayload data: data

      project_new: (data) ->
        that.get("notify").info "New project added"
        store.pushPayload data: data

      project_updated: (data) ->
        that.get("notify").info "Project `#{data.name}` updated"
        store.pushPayload data: data

      submission_new: (data) ->
        store.pushPayload data: data

      submission_updated: (data) ->
        store.pushPayload data: data

      project_deleted: (data) ->
        that.get("notify").info "Project `#{data.name}` deleted!"
        store.find('project', data.id).then (project) ->
          project.deleteRecord()

      collaboration_new: (data) ->
        store.pushPayload data: data

      collaboration_updated: (data) ->
        store.find('collaboration', data.id).then (collaboration) ->
          that.store.pushPayload data: data

      collaboration_deleted: (data) ->
        store.find('collaboration', data.id).then (collaboration) ->
          currentUserId = that.get("controllers.application.currentUser.id")
          if currentUserId is collaboration.get "user.id"
            location = "/"
            location.reload()
          else
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

    for k, v of allEvents
      channel.bind k, v


  actions:
    invalidateSession: ->
      @get('session').invalidate()

`export default AuthenticatedRoute`
