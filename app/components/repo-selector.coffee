`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`

RepoSelectorComponent = Ember.Component.extend

  isOpen: false
  project: null
  githubRepos: ["Loading..."]
  classNames: ['btn-group']
  classNameBindings: ['isOpen:open']

  fetchGithubRepos: (->
    githubReposUrl = [ENV.APP.API_BASE, ENV.endpoints.githubRepos].join '/'
    that = @
    Ember.$.get githubReposUrl
    .then (data)->
      that.set "githubRepos", data.repos
    .fail ->
      Notify.error "Something went wrong when trying to fetch repo list."

  ).on "init"


  actions:

    toggleDropdown: ->
      @set "isOpen", !@get "isOpen"

    selectRepo: (repo)->
      projectId = @get "project.id"
      setGithub = [ENV.APP.API_BASE, ENV.endpoints.setGithub, projectId].join '/'
      that = @
      data =
        repo: repo
      Ember.$.post setGithub, data
      .then (data)->
        debugger
      .fail ->
        debugger


`export default RepoSelectorComponent`
