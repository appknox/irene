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
    tFetchJIRAProjectFailed = @get "tFetchJIRAProjectFailed"
    return if ENV.environment is "test"
    url = [ENV.APP.API_BASE, ENV.endpoints.jiraProjects].join '/'
    that = @
    Ember.$.get url
    .then (data)->
      that.set "jiraProjects", data.projects
    .fail ->
      @get("notify").error tFetchJIRAProjectFailed

  ).on "init"

  actions:

    selectProject: (project)->
      tRepoIntegrated = @get "tRepoIntegrated"
      tRepoNotIntegrated = @get "tRepoNotIntegrated"
      projectId = @get "project.id"
      url = [ENV.APP.API_BASE, ENV.endpoints.setJira, projectId].join '/'
      that = @
      data =
        project: project
      Ember.$.post url, data
      .then (data)->
        @get("notify").success tRepoIntegrated
      .fail ->
        @get("notify").error tRepoNotIntegrated

`export default JiraProjectComponent`
