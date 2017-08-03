`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

GithubAccountComponent = Ember.Component.extend

  i18n: Ember.inject.service()

  tGithubWillBeRevoked: t("githubWillBeRevoked")

  confirmCallback: ->
    tGithubWillBeRevoked = @get "tGithubWillBeRevoked"
    that = @
    @get("ajax").post ENV.endpoints.revokeGitHub
    .then (data) ->
      that.get("notify").success tGithubWillBeRevoked
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
