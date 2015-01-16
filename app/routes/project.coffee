`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

ProjectRoute = Ember.Route.extend AuthenticatedRouteMixin,

  model: (params)->
    @store.find('project', params.project_id).then (project) -> project.reload()

`export default ProjectRoute`
