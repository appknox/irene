`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

GithubAccountComponent = Ember.Component.extend

  confirmCallback: ->
    that = @
    @get("ajax").post ENV.endpoints.revokeGitHub
    .then (data) ->
      that.get("notify").success "Your GitHub authorization will be revoked in a moment"
      that.send "closeRevokeGithubConfirmBox"
      setTimeout ->
        window.location.reload() # FIXME: Hackish Way
      ,
        3 * 1000
    .catch (error) ->
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:

    openRevokeGithubConfirmBox: ->
      @set "showRevokeGithubConfirmBox", true

    closeRevokeGithubConfirmBox: ->
      @set "showRevokeGithubConfirmBox", false

`export default GithubAccountComponent`
