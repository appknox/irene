`import Ember from 'ember'`

ProjectRoute = Ember.Route.extend

  model: (params)->
    @store.find('project', params.project_id)

`export default ProjectRoute`
