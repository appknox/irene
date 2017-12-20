`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

PaginateMixin = Ember.Mixin.create

  offset: 0
  meta: null
  version: 0
  extraQueryStrings: ""
  limit: ENV.paginate.perPageLimit
  isJsonApiPagination: false

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
    window.scrollTo 0, 0
    that = @
    if that.get 'isJsonApiPagination'
      query_limit = @get "limit"
      query_offset = @get "offset"
      query =
        'page[limit]': @get "limit"
        'page[offset]': query_limit * query_offset
    else
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
      meta = result.meta
      if result.links and result.meta.pagination
        meta.total = result.meta.pagination.count
        that.set 'isJsonApiPagination', true
      that.set "meta", meta
    objects
  ).property  "version"

  sortedObjects: Ember.computed.sort 'objects', 'sortProperties'

  objectCount: Ember.computed.alias 'objects.length'
  hasObjects: Ember.computed.gt 'objectCount', 0



  maxOffset: Ember.computed "meta.total", "limit", ->
    limit = @get "limit"
    total = @get "meta.total" or 0
    if total is 0
      return 0
    Math.ceil(total/limit) - 1  # `-1` because offset starts from 0

  pages: Ember.computed "maxOffset", "offset", ->
    offset = @get "offset"
    maxOffset = @get "maxOffset"
    startPage = 0
    stopPage = maxOffset
    offsetDiffStart = 0
    offsetDiffStop = 0

    if maxOffset in [NaN, 0, 1]
      return []
    if maxOffset <= (ENV.paginate.pagePadding * 2)
      return [startPage..stopPage]

    if offset > ENV.paginate.pagePadding
      startPage = offset - ENV.paginate.pagePadding
    else
      offsetDiffStart = ENV.paginate.pagePadding - offset

    if maxOffset >= ENV.paginate.pagePadding + offset
      stopPage = ENV.paginate.pagePadding + offset
    else
      offsetDiffStop =  (ENV.paginate.pagePadding + offset) - maxOffset

    startPage -= offsetDiffStop
    stopPage += offsetDiffStart

    [startPage..stopPage]

  preDot: Ember.computed "offset", ->
    offset = @get "offset"
    offset - ENV.paginate.pagePadding > 0

  postDot: Ember.computed "offset", "maxOffset", ->
    offset = @get "offset"
    maxOffset = @get "maxOffset"
    offset + ENV.paginate.pagePadding < maxOffset



  hasPrevious: Ember.computed.gt "offset", 0
  hasNext: Ember.computed 'offset', 'maxOffset', ->
    offset = @get "offset"
    maxOffset = @get "maxOffset"
    offset < maxOffset

  setOffset: (offset) ->
    @set "offset", offset


  actions:

    gotoPageFirst: ->
      @setOffset 0

    gotoPagePrevious: ->
      @decrementProperty "offset"

    gotoPage: (offset) ->
      @setOffset offset

    gotoPageNext: ->
      @incrementProperty "offset"

    gotoPageLast: ->
      @setOffset @get "maxOffset"

`export default PaginateMixin`
