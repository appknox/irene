`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedProjectFilesRoute = Ember.Route.extend ScrollTopMixin,

  title: "All Files" + config.platform
  model: ->
    @modelFor("authenticated.project")

`export default AuthenticatedProjectFilesRoute`
