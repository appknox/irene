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
  isRevokingJIRA: false
  isIntegratingJIRA: false

  tJiraIntegrated: t("jiraIntegrated")
  tJiraWillBeRevoked: t("jiraWillBeRevoked")
  tPleaseEnterAllDetails: t("pleaseEnterAllDetails")


  confirmCallback: ->
    tJiraWillBeRevoked = @get "tJiraWillBeRevoked"
    that = @
    @set "isRevokingJIRA", true
    @get("ajax").post ENV.endpoints.revokeJira
    .then (data) ->
      that.set "isRevokingJIRA", false
      that.get("notify").success tJiraWillBeRevoked
      that.send "closeRevokeJIRAConfirmBox"
      that.set "user.hasJiraToken", false
    .catch (error) ->
      that.set "isRevokingJIRA", false
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
      @set "isIntegratingJIRA", true
      @get("ajax").post ENV.endpoints.integrateJira, data: data
      .then (data)->
        that.set "isIntegratingJIRA", false
        that.get("notify").success tJiraIntegrated
        triggerAnalytics('feature',ENV.csb.integrateJIRA)
      .catch (error) ->
        that.set "isIntegratingJIRA", false 
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

    openRevokeJIRAConfirmBox: ->
      @set "showRevokeJIRAConfirmBox", true

    closeRevokeJIRAConfirmBox: ->
      @set "showRevokeJIRAConfirmBox", false

`export default JiraAccountComponent`
