`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

GithubProjectComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  project: null
  githubRepos: ["Loading..."]

  tProjectRemoved: t("projectRemoved")
  tRepoIntegrated: t("repoIntegrated")
  tFetchGitHubRepoFailed: t("fetchGitHubRepoFailed")

  confirmCallback: ->
    tProjectRemoved = @get "tProjectRemoved"
    projectId = @get "project.id"
    deleteGithub = [ENV.endpoints.deleteGHRepo, projectId].join '/'
    that = @
    @get("ajax").delete deleteGithub
    .then (data) ->
      that.get("notify").success tProjectRemoved
      that.send "closeDeleteGHConfirmBox"
      that.set "project.githubRepo", ""
    .catch (error) ->
      for error in error.errors
        that.get("notify").error error.detail?.message



  fetchGithubRepos: (->
    if ENV.environment is 'test'
      # FIXME: Fix this test properly
      return
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
      projectId = @get "project.id"
      setGithub = [ENV.endpoints.setGithub, projectId].join '/'
      that = @
      data =
        repo: repo
      @get("ajax").post setGithub, data: data
      .then (data) ->
        that.get("notify").success tRepoIntegrated
        that.set "project.githubRepo", repo
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

    openDeleteGHConfirmBox: ->
      @set "showDeleteGHConfirmBox", true

    closeDeleteGHConfirmBox: ->
      @set "showDeleteGHConfirmBox", false

`export default GithubProjectComponent`
