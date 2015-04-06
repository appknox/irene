`import Ember from 'ember'`
`import SocketMixin from 'irene/mixins/socket';`

ProjectSettingsController = Ember.Controller.extend

  needs: ['application']

  actions:
    integrateGitHub: ->
      currentUser = @get "controllers.application.currentUser"
      urls = currentUser.get "urls"
      window.location = urls.githubRedirect

`export default ProjectSettingsController`
