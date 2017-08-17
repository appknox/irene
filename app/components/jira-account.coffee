`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

JiraAccountComponent = Ember.Component.extend

  i18n: Ember.inject.service()

  user: null
  jiraHost: ""
  jiraUsername: ""
  jiraPassword: ""

  tJiraWillBeRevoked: t("jiraWillBeRevoked")
  tJiraIntegrated: t("jiraIntegrated")


  confirmCallback: ->
    tJiraWillBeRevoked = @get "tJiraWillBeRevoked"
    that = @
    @get("ajax").post ENV.endpoints.revokeJira
    .then (data) ->
      that.get("notify").success tJiraWillBeRevoked
      that.send "closeRevokeJIRAConfirmBox"
      that.set "user.hasJiraToken", false
    .catch (error) ->
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:

    integrateJira: ->
      tJiraIntegrated = @get "tJiraIntegrated"
      that = @
      data =
        host: @get("jiraHost").trim()
        username: @get("jiraUsername").trim()
        password: @get "jiraPassword"
      @get("ajax").post ENV.endpoints.integrateJira, data: data
      .then (data)->
        that.get("notify").success tJiraIntegrated
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    openRevokeJIRAConfirmBox: ->
      @set "showRevokeJIRAConfirmBox", true

    closeRevokeJIRAConfirmBox: ->
      @set "showRevokeJIRAConfirmBox", false

`export default JiraAccountComponent`
