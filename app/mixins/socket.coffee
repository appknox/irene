`import Ember from 'ember'`
`import Notify from 'ember-notify';`
`import cookieUtil from '../utils/cookies';`
`import ENUMS from '../enums';`

SocketMixin = Ember.Mixin.create
  sockets:
    connect: ->
      @socket.emit "subscribe", room: @session.get("user").uuid
      console.log "Socket is connected!"

    disconnect: ->
      console.log "Socket got disconnected!"

    analysis_updated: (data)->
      Notify.info "Analysis updated"
      @store.push "analysis", @store.normalize "analysis", data

    file_new: (data)->
      Notify.info "New file added"
      project = @store.push "project", @store.normalize "project", data.project
      file = @store.push "file", @store.normalize "file", data.file
      for analysis in data.analyses
        @store.push "analysis", @store.normalize "analysis", analysis
      project.set "lastFile", file

    file_updated: (data) ->
      Notify.info "File updated"
      file = @store.push "file", @store.normalize "file", data

    project_new: (data) ->
      Notify.info "New project added"
      @store.push "project", @store.normalize "project", data

    message: (data) ->
      message = data.message
      notifyType = data.notifyType
      Notify.info message if notifyType is ENUMS.NOTIFY.INFO
      Notify.success message if notifyType is ENUMS.NOTIFY.SUCCESS
      Notify.warning message if notifyType is ENUMS.NOTIFY.WARNING
      Notify.alert message if notifyType is ENUMS.NOTIFY.ALERT
      Notify.error message if notifyType is ENUMS.NOTIFY.ERROR


    logout: ->
      cookieUtil.deleteAllCookies()
      localStorage.clear()
      location.reload()

    reload: ->
      location.reload()

`export default SocketMixin`
