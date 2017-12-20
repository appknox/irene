`import Ember from 'ember'`

ProjectComponentComponent = Ember.Component.extend

  projects: (->
    that = @
    query =
      limit: 3
      offset: 0
      query: ""
      platform: -1
      reverse: true
      sortingKey: "lastFileCreatedOn"
    store = @get "store"
    store.query 'project', query
      .then (data)->
        that.set "projectCount", data.meta.total
        that.set "projects", data
  ).property()

  projectSortingKey: ['lastFileCreatedOn:desc']
  sortedProjects: Ember.computed.sort 'projects', 'projectSortingKey'

  viewAllProjects: (->
    projectCount = @get "projectCount"
    if projectCount > 3
      true
  ).property "projectCount"

`export default ProjectComponentComponent`
