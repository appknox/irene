`import Ember from 'ember'`

ProjectComponentComponent = Ember.Component.extend

  projects: (->
    that = @
    store = @get "store"
    store.findAll("project")
      .then (data)->
        that.set "projects", data.slice(0,3)
  ).property()


`export default ProjectComponentComponent`
