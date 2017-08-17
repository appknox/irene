`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

JiraProjectComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  project: null
  jiraProjects: ["Loading..."]


  tRepoIntegrated: t("repoIntegrated")
  tProjectRemoved: t("projectRemoved")
  tRepoNotIntegrated: t("repoNotIntegrated")
  tFetchJIRAProjectFailed: t("fetchProjectFailed")

  confirmCallback: ->
    tProjectRemoved = @get "tProjectRemoved"
    that = @
    projectId = @get "project.id"
    deleteJIRA = [ENV.endpoints.deleteJIRAProject, projectId].join '/'
    @get("ajax").delete deleteJIRA
    .then (data) ->
      that.get("notify").success tProjectRemoved
      that.send "closeDeleteJIRAConfirmBox"
      that.set "project.jiraProject", ""
    .catch (error) ->
      for error in error.errors
        that.get("notify").error error.detail?.message

  fetchJiraProjects: (->
    if ENV.environment is 'test'
      # FIXME: Fix this test properly
      return
    tFetchJIRAProjectFailed = @get "tFetchJIRAProjectFailed"
    that = @
    @get("ajax").request ENV.endpoints.jiraProjects
    .then (data) ->
      that.set "jiraProjects", data.projects
    .catch (error) ->
      that.get("notify").error tFetchJIRAProjectFailed
      for error in error.errors
        that.get("notify").error error.detail?.message

  ).on "init"

  actions:

    selectProject: ->
      project= @$('select').val()
      tRepoIntegrated = @get "tRepoIntegrated"
      tRepoNotIntegrated = @get "tRepoNotIntegrated"
      projectId = @get "project.id"
      url = [ENV.endpoints.setJira, projectId].join '/'
      that = @
      data =
        project: project
      @get("ajax").post url, data: data
      .then (data) ->
        that.get("notify").success tRepoIntegrated
        that.set "project.jiraProject", project
      .catch (error) ->
        that.get("notify").error tRepoNotIntegrated
        for error in error.errors
          that.get("notify").error error.detail?.message

    openDeleteJIRAConfirmBox: ->
      @set "showDeleteJIRAConfirmBox", true

    closeDeleteJIRAConfirmBox: ->
      @set "showDeleteJIRAConfirmBox", false

`export default JiraProjectComponent`
