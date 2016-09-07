`import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';`
`import Ember from 'ember';`
`import EmberCLIICAjax from 'ic-ajax';`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`
`import ENUMS from 'irene/enums';`

pusher = new Pusher ENV.pusherKey, encrypted: true

ApplicationRoute = Ember.Route.extend ApplicationRouteMixin,


  setupEvents: (channel)->
    that = @
    store = @get "store"
    allEvents =
      analysis_new: (data)->
        store.push store.normalize "analysis", data

      analysis_updated: (data)->
        risk = data.risk

        store.find("vulnerability", data.vulnerability).then (vulnerability)->
          message = "Analysis Updated: #{vulnerability.get "name"}"
          Notify.info message if risk is ENUMS.RISK.LOW
          Notify.success message if risk is ENUMS.RISK.NONE
          Notify.warning message if risk is ENUMS.RISK.MEDIUM
          Notify.error message if risk is ENUMS.RISK.HIGH

        store.push store.normalize "analysis", data

        ratio = store.peakAll("ratio").objectAt 0
        if risk in [ENUMS.RISK.NONE, ENUMS.RISK.LOW]
          ratio.incrementUnaffected()
        else if risk in [ENUMS.RISK.MEDIUM, ENUMS.RISK.HIGH]
          ratio.incrementAffected()

      file_new: (data)->
        Notify.info "New file added"
        file = store.push store.normalize "file", data
        project.set "lastFile", file

      file_updated: (data) ->
        Notify.info "File updated"
        store.push store.normalize "file", data

      user_updated: (data) ->
        store.push store.normalize "user", data

      project_new: (data) ->
        Notify.info "New project added"
        store.push store.normalize "project", data

      project_updated: (data) ->
        Notify.info "Project `#{data.name}` updated"
        store.push store.normalize "project", data

      submission_new: (data) ->
        console.log data
        store.push store.normalize "submission", data

      submission_updated: (data) ->
        console.log data
        store.push store.normalize "submission", data

      project_deleted: (data) ->
        Notify.info "Project `#{data.name}` deleted!"
        store.find('project', data.id).then (project) ->
          project.deleteRecord()

      collaboration_new: (data) ->
        store.push store.normalize "collaboration", data

      collaboration_updated: (data) ->
        store.find('collaboration', data.id).then (collaboration) ->
          that.store.push store.normalize "collaboration", data

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
        Notify.info message if notifyType is ENUMS.NOTIFY.INFO
        Notify.success message if notifyType is ENUMS.NOTIFY.SUCCESS
        Notify.warning message if notifyType is ENUMS.NOTIFY.WARNING
        Notify.alert message if notifyType is ENUMS.NOTIFY.ALERT
        Notify.error message if notifyType is ENUMS.NOTIFY.ERROR


      logout: ->
        localStorage.clear()
        location.reload()

      reload: ->
        location.reload()

      namespace_add: (data)->
        that.get("controllers.application.namespaceAddModal").set "added", true
        that.get("controllers.application.namespaceAddModal").set "namespace", data.namespace
        that.get("controllers.application.namespaceAddModal").send "showModal"

    for k, v of allEvents
      channel.bind k, v


  fetchData: ->
    that = @
    store = @get "store"
    initUrl = [ENV.APP.API_BASE, ENV.endpoints.init].join '/'
    controller = @controller
    new Ember.RSVP.Promise (resolve, reject) ->
      init = EmberCLIICAjax url:initUrl, type: "get"
      init.then (result) ->
        for vulnerability in result.vulnerabilities
          store.pushPayload 'vulnerability', vulnerability: vulnerability
        for pricing in result.pricings
          store.pushPayload 'pricing', pricing: pricing
        for user in result.users
          store.pushPayload 'user', user: user
        for project in result.projects
          store.pushPayload 'project', project: project
        for submission in result.submissions
          store.pushPayload 'submission', submission: submission
        for collaboration in result.collaborations
          store.pushPayload 'collaboration', collaboration: collaboration
        for file in result.files
          store.pushPayload 'file', file: file
        for analysis in result.analyses
          store.pushPayload 'analysis', analysis: analysis
        store.pushPayload 'ratio', ratio: result.ratio
        user = store.pushPayload 'user', user: result.currentUser
        store.find('user', result.currentUser.id).then (user)->
          user.set 'urls', result.urls
          controller.set 'currentUser', user
          channel = pusher.subscribe user.get "socketId"
          that.setupEvents channel
          Raven.setUserContext
            email: user.get "email"
            id: user.get "id"
          Raven.captureMessage "User Logged in", level: "info"
          window.Intercom "boot",
            app_id: ENV.intercomAppID
            name: user.get "username"
            email: user.get "email"
        controller.set 'initLoaded', true
        resolve result

  setupController: (controller)->
    if !Ember.isEmpty localStorage.authToken
      @fetchData()

  actions:

    sessionAuthenticationSucceeded: ->
      @_super()
      @fetchData()

`export default ApplicationRoute;`
