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
    return if ENV.environment is "test"
    githubReposUrl = [ENV.APP.API_BASE, ENV.endpoints.githubRepos].join '/'
    that = @
    Ember.$.get githubReposUrl
    .then (data)->
      that.set "githubRepos", data.repos
    .fail ->
      Notify.error "Something went wrong when trying to fetch repo list."

  ).on "init"

  mouseLeave: ->
      @set "isOpen", false

  actions:

    toggleDropdown: ->
      @set "isOpen", !@get "isOpen"

    selectRepo: (repo)->
      @set "isOpen", false
      projectId = @get "project.id"
      setGithub = [ENV.APP.API_BASE, ENV.endpoints.setGithub, projectId].join '/'
      that = @
      data =
        repo: repo
      Ember.$.post setGithub, data
      .then (data)->
        Notify.success "Repo successfully integrated"
      .fail ->
        Notify.error "Something went wrong whe trying to update this repo"

    revokeGitHub: ->
      return if !confirm "Do you want to revoke GitHub Authorization ?"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.revokeGitHub].join '/'
      that = @
      Ember.$.post postUrl
      .then ->
        Notify.success "Your github authorization will be revoked in a moment"
      .fail (xhr, message, status) ->
        debugger
        Notify.error xhr.responseJSON.message

`export default RepoSelectorComponent`
