`import Ember from 'ember'`

AuthenticatedProjectFilesRoute = Ember.Route.extend

  titleToken: "All Files"
  model: ->
    @modelFor("authenticated.project").get('files')

`export default AuthenticatedProjectFilesRoute`
