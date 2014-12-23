`import Ember from 'ember'`
`import Notify from 'ember-notify';`
`import cookieUtil from '../utils/cookies';`

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
      file = @store.normalize "file", data
      file.get "analyses"
      @store.push "file", file
      @store
        .find 'project', data.project
        .then (project) ->
          project.set "lastFile", file

    project_new: (data) ->
      Notify.info "New project added"
      @store.push "project", @store.normalize "project", data

    logout: ->
      cookieUtil.deleteAllCookies()
      localStorage.clear()
      location.reload()

    reload: ->
      location.reload()

`export default SocketMixin`
