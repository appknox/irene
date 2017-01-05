`import Ember from 'ember'`

ProjectListComponent = Ember.Component.extend

  limit: 9
  offset: 0
  meta: null

  classNames: ["columns", "tour-step-project"]

  projects: ( ->
    that = @
    query =
      limit: @get "limit"
      offset: @get "offset"
    console.log query
    projects = @get('store').query 'project', query
    projects.then (result) ->
      that.set "meta", result.meta
    projects
  ).property 'limit', 'offset'

  sortProperties: ["lastFileCreatedOn:desc"]
  sortedProjects: Ember.computed.sort 'projects', 'sortProperties'

  projectCount: Ember.computed.alias 'projects.length'
  hasProjects: Ember.computed.gt 'projectCount', 0

  maxOffset: Ember.computed "meta.total", "limit", ->
    limit = @get "limit"
    total = @get "meta.total" or 0
    Math.floor(total/limit) - 1  # `-1` because offset starts from 0

  pages: Ember.computed "maxOffset", ->
    maxOffset = @get "maxOffset"
    Array.from length: maxOffset + 1, (v, k) -> k


  hasPrevious: Ember.computed.gt "offset", 0
  hasNext: Ember.computed 'offset', 'maxOffset', ->
    offset = @get "offset"
    maxOffset = @get "maxOffset"
    console.log offset, maxOffset
    offset < maxOffset

  actions:

    previousPage: ->
      @set "offset", @get("offset") - 1

    gotoPage: (offset) ->
      @set "offset", offset

    nextPage: ->
      @set "offset", @get("offset") + 1

`export default ProjectListComponent`
