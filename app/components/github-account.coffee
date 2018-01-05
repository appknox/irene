`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`
`import triggerAnalytics from 'irene/utils/trigger-analytics'`

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
      that.set "user.hasGithubToken", false
    .catch (error) ->
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:

    integrateGithub: ->
      triggerAnalytics('feature',ENV.csb.integrateGithub)
      window.open(@get "user.githubRedirectUrl", '_blank');

    openRevokeGithubConfirmBox: ->
      @set "showRevokeGithubConfirmBox", true

    closeRevokeGithubConfirmBox: ->
      @set "showRevokeGithubConfirmBox", false

`export default GithubAccountComponent`
