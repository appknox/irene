`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

RepoSelectorComponent = Ember.Component.extend

  isOpen: false
  project: null
  githubRepos: []
  classNames: ['btn-group']
  classNameBindings: ['isOpen:open']

  fetchGithubRepos: (->
    @set "githubRepos", ["one", "four"]
  ).on "init"


  actions:

    toggleDropdown: ->
      @set "isOpen", !@get "isOpen"

    selectRepo: (repo)->
      debugger


`export default RepoSelectorComponent`
