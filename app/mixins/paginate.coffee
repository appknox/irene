`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

PaginateMixin = Ember.Mixin.create

  offset: 0
  meta: null
  extraQueries: null
  limit: ENV.objectsPerPage

  objects: ( ->
    that = @
    query =
      limit: @get "limit"
      offset: @get "offset"
    extraQueries = @get "extraQueries"
    for key, value of extraQueries
      query[key] = value
    targetObject = @get "targetObject"
    objects = @get('store').query targetObject, query
    objects.then (result) ->
      that.set "meta", result.meta
    objects
  ).property 'limit', 'offset', "targetObject", "extraQueries"

  sortedObjects: Ember.computed.sort 'objects', 'sortProperties'

  objectCount: Ember.computed.alias 'objects.length'
  hasObjects: Ember.computed.gt 'objectCount', 0

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
    offset < maxOffset

  actions:

    previousPage: ->
      @set "offset", @get("offset") - 1

    gotoPage: (offset) ->
      @set "offset", offset

    nextPage: ->
      @set "offset", @get("offset") + 1


`export default PaginateMixin`
