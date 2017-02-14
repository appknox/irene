`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

JiraProjectComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  project: null
  jiraProjects: ["Loading..."]

  tFetchJIRAProjectFailed: t("fetchProjectFailed")
  tRepoIntegrated: t("repoIntegrated")
  tRepoNotIntegrated: t("repoNotIntegrated")

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
      .catch (error) ->
        that.get("notify").error tRepoNotIntegrated
        for error in error.errors
          that.get("notify").error error.detail?.message

    deleteJIRAProject: ->
      return if !confirm "Do you want to remove JIRA Project ?"
      that = @
      projectId = @get "project.id"
      deleteJIRA = [ENV.endpoints.deleteJIRAProject, projectId].join '/'
      @get("ajax").post deleteJIRA
      .then (data) ->
        window.location.reload()
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default JiraProjectComponent`
