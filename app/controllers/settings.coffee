`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`

isValidPassword = (password)->
  return password.length > 5

SettingsController = Ember.Controller.extend
  needs: ['application']

  passwordCurrent: ""
  passwordNew: ""
  passwordConfirm: ""

  jiraHost: ""
  jiraUsername: ""
  jiraPassword: ""

  actions:

    integrateGitHub: ->
      currentUser = @get "controllers.application.currentUser"
      urls = currentUser.get "urls"
      window.location = urls.githubRedirect

    revokeGitHub: ->
      return if !confirm "Do you want to revoke GitHub Authorization ?"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.revokeGitHub].join '/'
      that = @
      Ember.$.post postUrl
      .then ->
        Notify.success "Your github authorization will be revoked in a moment"
      .fail (xhr, message, status) ->
        Notify.error xhr.responseJSON.message

    integrateJira: ->
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.integrateJira].join '/'
      that = @
      data =
        host: @get "jiraHost"
        username: @get "jiraUsername"
        password: @get "jiraPassword"
      Ember.$.post postUrl, data
      .then ->
        Notify.success "Your jira authorization will be revoked in a moment"
      .fail (xhr, message, status) ->
        Notify.error xhr.responseJSON.message

    revokeJira: ->
      return if !confirm "Do you want to revoke JIRA Authorization ?"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.revokeJira].join '/'
      that = @
      Ember.$.post postUrl
      .then ->
        Notify.success "Your jira authorization will be revoked in a moment"
      .fail (xhr, message, status) ->
        Notify.error xhr.responseJSON.message

    changePassword: ->
      passwordCurrent = @get "passwordCurrent"
      passwordNew = @get "passwordNew"
      passwordConfirm = @get "passwordConfirm"
      for password in [passwordCurrent, passwordNew, passwordConfirm]
        return Notify.error("Please enter valid passwords!") if !isValidPassword password
      if passwordNew isnt passwordConfirm
        return Notify.error "passwords did not match"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.changePassword].join '/'
      data =
        password: passwordCurrent
        newPassword: passwordNew
      that = @
      Ember.$.post postUrl, data
      .then ->
        Notify.success "Your password has been changed."
      .fail (xhr, message, status) ->
        Notify.error xhr.responseJSON.message

    requestNamespace: ->
      @get("controllers.application.namespaceAddModal").set "added", false
      @get("controllers.application.namespaceAddModal").set "namespace", ""
      @get("controllers.application.namespaceAddModal").send "showModal"
`export default SettingsController`
