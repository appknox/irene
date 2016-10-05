`import Ember from 'ember'`

AuthenticatedFileRoute = Ember.Route.extend

  model: (params)->
    file: @get('store').find('file', params.fileId)
    vulnerability: @get('store').findAll('vulnerability')

`export default AuthenticatedFileRoute`
