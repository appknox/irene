`import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';`
`import Ember from 'ember';`

ApplicationRoute = Ember.Route.extend ApplicationRouteMixin,

  fetchData: ->
    @store.find 'vulnerability'
    projects = @store.find 'project'
    projects.then (projects) ->
      projects.forEach (project) ->
        lastFile = project.get('lastFile').then (lastFile) ->
          lastFile.get 'analyses'

  setupController: (controller)->
    if @session.get("user")
      @fetchData()

  actions:

    sessionAuthenticationSucceeded: ->
      @fetchData()
      @_super()

`export default ApplicationRoute;`
