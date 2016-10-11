`import Ember from 'ember'`

AuthenticatedFileRoute = Ember.Route.extend

  model: (params)->
    @get('store').findRecord('file', params.fileId)

`export default AuthenticatedFileRoute`
