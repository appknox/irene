`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

GithubAccountComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  isOpen: false
  project: null
  githubRepos: ["Loading..."]
  classNames: ['btn-group']
  classNameBindings: ['isOpen:open']

  tFetchGitHubRepoFailed: t("fetchGitHubRepoFailed")
  tRepoIntegrated: t("repoIntegrated")
  repoNotIntegrated: t("repoNotIntegrated")

  fetchGithubRepos: (->
    tFetchGitHubRepoFailed = @get "tFetchGitHubRepoFailed"
    return if ENV.environment is "test"
    githubReposUrl = [ENV.APP.API_BASE, ENV.endpoints.githubRepos].join '/'
    that = @
    Ember.$.get githubReposUrl
    .then (data)->
      that.set "githubRepos", data.repos
    .fail ->
      @get("notify").error tFetchGitHubRepoFailed

  ).on "init"

  mouseLeave: ->
      @set "isOpen", false

  actions:

    toggleDropdown: ->
      @set "isOpen", !@get "isOpen"

    selectRepo: (repo)->
      tRepoIntegrated = @get "tRepoIntegrated"
      repoNotIntegrated = @get "repoNotIntegrated"
      @set "isOpen", false
      projectId = @get "project.id"
      setGithub = [ENV.APP.API_BASE, ENV.endpoints.setGithub, projectId].join '/'
      that = @
      data =
        repo: repo
      Ember.$.post setGithub, data
      .then (data)->
        @get("notify").success tRepoIntegrated
      .fail ->
        @get("notify").error repoNotIntegrated

`export default GithubAccountComponent`
