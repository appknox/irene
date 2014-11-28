`import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';`
`import Ember from 'ember';`

ApplicationRoute = Ember.Route.extend ApplicationRouteMixin,

  setupController: (controller)->
    @store.findAll 'vulnerability'
    projects = @store.find 'project'
    projects.then (projects) ->
      projects.forEach (project) ->
        lastFile = project.get('lastFile').then (lastFile) ->
          lastFile.get 'analyses'


`export default ApplicationRoute;`
