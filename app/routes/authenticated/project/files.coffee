`import Ember from 'ember'`

AuthenticatedProjectFilesRoute = Ember.Route.extend
  model: () ->
    @get('store').findAll('file')
`export default AuthenticatedProjectFilesRoute`
