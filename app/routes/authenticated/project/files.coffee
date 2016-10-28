`import Ember from 'ember'`

AuthenticatedProjectFilesRoute = Ember.Route.extend

  model: ->
    @modelFor("authenticated.project").get('files')

`export default AuthenticatedProjectFilesRoute`
