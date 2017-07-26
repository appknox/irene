`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`

JiraAccountComponent = Ember.Component.extend

  user: null
  jiraHost: ""
  jiraUsername: ""
  jiraPassword: ""

  confirmCallback: ->
    that = @
    @get("ajax").post ENV.endpoints.revokeJira
    .then (data) ->
      that.get("notify").success "Your JIRA authorization will be revoked in a moment"
      that.send "closeRevokeJIRAConfirmBox"
      setTimeout ->
        window.location.reload() # FIXME: Hackish Way
      ,
        3 * 1000
    .catch (error) ->
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:

    integrateJira: ->
      that = @
      data =
        host: @get("jiraHost").trim()
        username: @get("jiraUsername").trim()
        password: @get "jiraPassword"
      @get("ajax").post ENV.endpoints.integrateJira, data: data
      .then (data)->
        that.get("notify").success "JIRA integrated"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    openRevokeJIRAConfirmBox: ->
      @set "showRevokeJIRAConfirmBox", true

    closeRevokeJIRAConfirmBox: ->
      @set "showRevokeJIRAConfirmBox", false

`export default JiraAccountComponent`
