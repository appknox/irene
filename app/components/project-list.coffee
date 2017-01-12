`import Ember from 'ember'`
`import PaginateMixin from 'irene/mixins/paginate'`
`import ENUMS from 'irene/enums'`
`import {filterPlatformValues} from 'irene/helpers/filter-platform'`

ProjectListComponent = Ember.Component.extend PaginateMixin,

  query: ""
  targetObject: "project"

  sortingKey: "lastFileCreatedOn"
  sortingReversed: true
  platformType: ENUMS.PLATFORM.UNKNOWN

  newProjectsObserver: Ember.observer "realtime.projectsCounter", ->
    @incrementProperty "version"

  sortProperties: (->
    sortingKey = @get "sortingKey"
    sortingReversed = @get "sortingReversed"
    if sortingReversed
      sortingKey = "#{sortingKey}:desc"
    [sortingKey]
  ).property "sortingKey", "sortingReversed"

  classNames: ["columns", "tour-step-project"]

  resetOffset: ->
    @set "offset", 0

  offsetResetter: Ember.observer "query", "sortingKey", "sortingReversed", "platformType", ->
    for property in ["query"]
      propertyOldName = "_#{property}"
      propertyNewValue = @get property
      propertyOldValue = @get propertyOldName
      propertyChanged = propertyOldValue isnt propertyNewValue
      if propertyChanged
        @set propertyOldName, propertyNewValue
        Ember.run.once @, 'resetOffset'


  extraQueryStrings: Ember.computed "query", "sortingKey", "sortingReversed", "platformType", ->
    query =
      query: @get "query"
      sortingKey: @get "sortingKey"
      reverse: @get "sortingReversed"
      platform: @get "platformType"
    JSON.stringify query, Object.keys(query).sort()

  sortingKeyObjects: (->
    keyObjects = [
      { key: "lastFileCreatedOn", text: "Date Updated"},
      { key: "createdOn", text: "Date Created"},
      { key: "name", text: "Project Name"},
      { key: "packageName", text: "Package Name"}
    ]
    keyObjectsWithReverse = []
    for keyObject in keyObjects
      for reverse in [true, false]
        keyObjectFull = {}
        keyObjectFull.reverse = reverse
        keyObjectFull.key = keyObject.key
        keyObjectFull.text = keyObject.text
        if reverse
          keyObjectFull.text += " in descending order"
        else
          keyObjectFull.text += " in ascending order"
        keyObjectsWithReverse.push keyObjectFull
    keyObjectsWithReverse
  ).property()

  platformObjects: ENUMS.PLATFORM.CHOICES[..-4]
  actions:
    sortProjects: ->
      select = $(@element).find("#project-sort-property")
      [sortingKey, sortingReversed] = filterPlatformValues select.val()
      @set "sortingKey", sortingKey
      @set "sortingReversed", sortingReversed

    filterPlatform: ->
      select = $(@element).find("#project-filter-platform")
      @set "platformType", select.val()

`export default ProjectListComponent`
