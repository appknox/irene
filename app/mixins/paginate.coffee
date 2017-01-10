`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

PaginateMixin = Ember.Mixin.create

  offset: 0
  meta: null
  version: 0
  extraQueryStrings: ""
  limit: ENV.objectsPerPage

  versionIncrementer: ->
    @incrementProperty "version"

  versionTrigger: Ember.observer 'limit', 'offset', "targetObject", "extraQueryStrings", ->
    for property in ['limit', 'offset', "targetObject", "extraQueryStrings"]
      propertyOldName = "_#{property}"
      propertyNewValue = @get property
      propertyOldValue = @get propertyOldName
      propertyChanged = propertyOldValue isnt propertyNewValue
      if propertyChanged
        @set propertyOldName, propertyNewValue
        Ember.run.once @, 'versionIncrementer'

  objects: ( ->
    that = @
    query =
      limit: @get "limit"
      offset: @get "offset"
    extraQueryStrings = @get "extraQueryStrings"
    if !Ember.isEmpty extraQueryStrings
      extraQueries = JSON.parse extraQueryStrings
      for key, value of extraQueries
        query[key] = value
    targetObject = @get "targetObject"
    objects = @get('store').query targetObject, query
    objects.then (result) ->
      that.set "meta", result.meta
    objects
  ).property  "version"

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
      @decrementProperty "offset"

    gotoPage: (offset) ->
      @set "offset", offset

    nextPage: ->
      @incrementProperty "offset"


`export default PaginateMixin`
