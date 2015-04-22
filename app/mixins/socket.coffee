`import Ember from 'ember'`
`import Notify from 'ember-notify';`
`import ENUMS from 'irene/enums';`

SocketMixin = Ember.Mixin.create

  needs: ['application']

  subscribe: (room) ->
    @socket.emit "subscribe", room: room

  sockets:
    connect: ->
      console.log "Socket is connected!"

    disconnect: ->
      console.log "Socket got disconnected!"

    analysis_updated: (data)->
      risk = data.risk

      @store.find("vulnerability", data.vulnerability).then (vulnerability)->
        message = "Analysis Updated: #{vulnerability.get "name"}"
        Notify.info message if risk is ENUMS.RISK.LOW
        Notify.success message if risk is ENUMS.RISK.NONE
        Notify.warning message if risk is ENUMS.RISK.MEDIUM
        Notify.error message if risk is ENUMS.RISK.HIGH

      @store.push "analysis", @store.normalize "analysis", data

      @store.find("ratio", 1).then (ratio)->
        if risk in [ENUMS.RISK.NONE, ENUMS.RISK.LOW]
          ratio.incrementUnaffected()
        else if risk in [ENUMS.RISK.MEDIUM, ENUMS.RISK.HIGH]
          ratio.incrementAffected()

    file_new: (data)->
      Notify.info "New file added"
      project = @store.push "project", @store.normalize "project", data.project
      file = @store.push "file", @store.normalize "file", data.file
      for analysis in data.analyses
        @store.push "analysis", @store.normalize "analysis", analysis
      project.set "lastFile", file

    file_updated: (data) ->
      Notify.info "File updated"
      @store.push "file", @store.normalize "file", data

    user_updated: (data) ->
      @store.push "user", @store.normalize "user", data

    project_new: (data) ->
      Notify.info "New project added"
      @store.push "project", @store.normalize "project", data

    project_updated: (data) ->
      Notify.info "Project `#{data.name}` updated"
      @store.push "project", @store.normalize "project", data

    project_deleted: (data) ->
      Notify.info "Project `#{data.name}` deleted!"
      @store.find('project', data.id).then (project) ->
        project.deleteRecord()

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

    show_feedback: ->
      @get("controllers.application.feedback").send("showModal")

`export default SocketMixin`
