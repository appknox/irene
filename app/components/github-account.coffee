`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

GithubAccountComponent = Ember.Component.extend

  actions:

    revokeGitHub: ->
      return if !confirm "Do you want to revoke GitHub Authorization ?"
      that = @
      @get("ajax").post ENV.endpoints.revokeGitHub
      .then (data) ->
        that.get("notify").success "Your GitHub authorization will be revoked in a moment"
        window.location.reload() # FIXME: Hackish Way
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default GithubAccountComponent`
