`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';`

ProjectFilesRoute = Ember.Route.extend AuthenticatedRouteMixin,

  model: (params)->
    @modelFor "project"

`export default ProjectFilesRoute`
