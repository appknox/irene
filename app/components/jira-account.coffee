`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`
`import triggerAnalytics from 'irene/utils/trigger-analytics'`

JiraAccountComponent = Ember.Component.extend

  i18n: Ember.inject.service()

  user: null
  jiraHost: ""
  jiraUsername: ""
  jiraPassword: ""

  tJiraIntegrated: t("jiraIntegrated")
  tJiraWillBeRevoked: t("jiraWillBeRevoked")
  tPleaseEnterAllDetails: t("pleaseEnterAllDetails")


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
      tPleaseEnterAllDetails = @get "tPleaseEnterAllDetails"
      host =  @get("jiraHost").trim()
      username =  @get("jiraUsername").trim()
      password =  @get "jiraPassword"
      if !host or !username or !password
        return @get("notify").error tPleaseEnterAllDetails, ENV.notifications
      that = @
      data =
        host: host
        username: username
        password: password
      @get("ajax").post ENV.endpoints.integrateJira, data: data
      .then (data)->
        that.get("notify").success tJiraIntegrated
        triggerAnalytics('feature',ENV.csb.integrateJIRA)
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

    openRevokeJIRAConfirmBox: ->
      @set "showRevokeJIRAConfirmBox", true

    closeRevokeJIRAConfirmBox: ->
      @set "showRevokeJIRAConfirmBox", false

`export default JiraAccountComponent`
