`import Ember from 'ember'`

GithubAccountComponent = Ember.Component.extend

  actions:

    integrateGitHub: ->
      currentUser = @get "controllers.application.currentUser"
      urls = currentUser.get "urls"
      window.location = urls.githubRedirect

    revokeGitHub: ->
      return if !confirm "Do you want to revoke GitHub Authorization ?"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.revokeGitHub].join '/'
      that = @
      Ember.$.post postUrl
      .then ->
        Notify.success "Your github authorization will be revoked in a moment"
      .fail (xhr, message, status) ->
        Notify.error xhr.responseJSON.message

`export default GithubAccountComponent`
