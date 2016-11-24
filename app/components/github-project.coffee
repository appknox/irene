`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

GithubProjectComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  project: null
  githubRepos: ["Loading..."]

  tFetchGitHubRepoFailed: t("fetchGitHubRepoFailed")
  tRepoIntegrated: t("repoIntegrated")
  repoNotIntegrated: t("repoNotIntegrated")

  fetchGithubRepos: (->
    tFetchGitHubRepoFailed = @get "tFetchGitHubRepoFailed"
    that = @

    @get("ajax").request ENV.endpoints.githubRepos
    .then (data) ->
      that.set "githubRepos", data.repos
    .catch (error) ->
      that.get("notify").error tFetchGitHubRepoFailed
      for error in error.errors
        that.get("notify").error error.detail?.message

  ).on "init"

  actions:

    selectRepo: ->
      repo = @$('select').val()
      tRepoIntegrated = @get "tRepoIntegrated"
      repoNotIntegrated = @get "repoNotIntegrated"
      projectId = @get "project.id"
      setGithub = [ENV.endpoints.setGithub, projectId].join '/'
      that = @
      data =
        repo: repo
      @get("ajax").post setGithub, data: data
      .then (data) ->
        that.get("notify").success "Your JIRA has been integrated"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default GithubProjectComponent`
