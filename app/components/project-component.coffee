`import Ember from 'ember'`

ProjectComponentComponent = Ember.Component.extend

  projects: (->
    that = @
    query =
      limit: 3
      offset: 0
      reverse: true
    store = @get "store"
    store.query 'project', query
      .then (data)->
        that.set "projectCount", data.toArray().length
        that.set "projects", data
  ).property()

  viewAllProjects: (->
    projectCount = @get "projectCount"
    if projectCount > 3
      true
  ).property "projectCount"

`export default ProjectComponentComponent`
