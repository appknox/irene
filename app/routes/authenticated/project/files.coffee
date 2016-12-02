`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedProjectFilesRoute = Ember.Route.extend

  title: "All Files" + config.Platform
  model: ->
    @modelFor("authenticated.project").get('files')

`export default AuthenticatedProjectFilesRoute`
