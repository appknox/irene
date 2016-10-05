`import Ember from 'ember'`

AuthenticatedFileRoute = Ember.Route.extend

  model: (params)->
    @get('store').find('file', params.fileId)

`export default AuthenticatedFileRoute`
