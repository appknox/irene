`import Ember from 'ember'`


AuthenticatedProjectRoute = Ember.Route.extend

  model: (params)->
    @store.findRecord "project", params.projectId

`export default AuthenticatedProjectRoute`
