`import Ember from 'ember'`

ProjectComponentComponent = Ember.Component.extend

  projects: (->
    that = @
    store = @get "store"
    store.findAll("project")
      .then (data)->
        that.set "projectCount", data.toArray().length
        that.set "projects", data.slice(0,3)
  ).property()

  viewAllProjects: (->
    projectCount = @get "projectCount"
    if projectCount > 3
      true
  ).property "projectCount"

`export default ProjectComponentComponent`
