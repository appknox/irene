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
      host =  @get("jiraHost").trim()
      username =  @get("jiraUsername").trim()
      password =  @get "jiraPassword"
      if !host and !username and !password
        return @get("notify").error "Please enter all the details", ENV.notifications
      that = @
      data =
        host: host
        username: username
        password: password
      @get("ajax").post ENV.endpoints.integrateJira, data: data
      .then (data)->
        that.get("notify").success tJiraIntegrated
        analytics.feature(ENV.csb.feature.integrateJIRA, ENV.csb.module.report, ENV.csb.product.appknox)
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

    openRevokeJIRAConfirmBox: ->
      @set "showRevokeJIRAConfirmBox", true

    closeRevokeJIRAConfirmBox: ->
      @set "showRevokeJIRAConfirmBox", false

`export default JiraAccountComponent`
