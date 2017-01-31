`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`

JiraAccountComponent = Ember.Component.extend

  user: null
  jiraHost: ""
  jiraUsername: ""
  jiraPassword: ""

  actions:

    integrateJira: ->
      that = @
      data =
        host: @get("jiraHost").trim()
        username: @get("jiraUsername").trim()
        password: @get "jiraPassword"
      debugger
      @get("ajax").post ENV.endpoints.integrateJira, data: data
      .then (data)->
        that.get("notify").success "JIRA integrated"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    revokeJira: ->
      return if !confirm "Do you want to revoke JIRA Authorization ?"
      that = @
      @get("ajax").post ENV.endpoints.revokeJira
      .then (data) ->
        that.get("notify").success "Your JIRA authorization will be revoked in a moment"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default JiraAccountComponent`
