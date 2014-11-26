`import Ember from 'ember';`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

IndexRoute = Ember.Route.extend AuthenticatedRouteMixin,

  setupController: (controller) ->
    if Ember.isEmpty controller.get 'model'
      projects = @store.findAll 'project'
      projects.then (projects) ->
        projects.forEach (project) ->
          lastFile = project.get('lastFile').then (lastFile) ->
            lastFile.get 'analyses'
      controller.set 'model', projects

`export default IndexRoute;`
