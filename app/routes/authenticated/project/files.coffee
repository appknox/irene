`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedProjectFilesRoute = Ember.Route.extend

  title: "All Files" + config.platform
  model: ->
    @modelFor("authenticated.project").get('files')
  activate: ->
    window.scrollTo(0,0)  

`export default AuthenticatedProjectFilesRoute`
