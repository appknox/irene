`import Ember from 'ember'`
`import PaginateMixin from 'irene/mixins/paginate'`
`import ENUMS from 'irene/enums'`
`import {filterPlatformValues} from 'irene/helpers/filter-platform'`
`import { translationMacro as t } from 'ember-i18n'`

ProjectListComponent = Ember.Component.extend PaginateMixin,

  i18n: Ember.inject.service()

  classNames: ["columns"]

  query: ""
  targetObject: "project"

  sortingKey: "lastFileCreatedOn"
  sortingReversed: true
  platformType: ENUMS.PLATFORM.UNKNOWN

  tDateUpdated: t("dateUpdated")
  tDateCreated: t("dateCreated")
  tProjectName: t("projectName")
  tPackageName: t("packageName")
  tMostRecent: t("mostRecent")
  tLeastRecent: t("leastRecent")

  newProjectsObserver: Ember.observer "realtime.ProjectCounter", ->
    @incrementProperty "version"

  sortProperties: (->
    sortingKey = @get "sortingKey"
    sortingReversed = @get "sortingReversed"
    if sortingReversed
      sortingKey = "#{sortingKey}:desc"
    [sortingKey]
  ).property "sortingKey", "sortingReversed"

  resetOffset: ->
    @set "offset", 0

  offsetResetter: Ember.observer "query", "sortingKey", "sortingReversed", "platformType", ->
    for property in ["query", "sortingKey", "sortingReversed", "platformType"]
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
    tDateUpdated = @get "tDateUpdated"
    tDateCreated = @get "tDateCreated"
    tProjectName = @get "tProjectName"
    tPackageName = @get "tPackageName"
    tLeastRecent = @get "tLeastRecent"
    tMostRecent = @get "tMostRecent"
    keyObjects = [
      { key: "lastFileCreatedOn", text: tDateUpdated },
      { key: "createdOn", text: tDateCreated },
      { key: "name", text: tProjectName },
      { key: "packageName", text: tPackageName }
    ]
    keyObjectsWithReverse = []
    for keyObject in keyObjects
      for reverse in [true, false]
        keyObjectFull = {}
        keyObjectFull.reverse = reverse
        keyObjectFull.key = keyObject.key
        keyObjectFull.text = keyObject.text
        if reverse
          if keyObject.key in ["lastFileCreatedOn", "createdOn"]
            keyObjectFull.text += tMostRecent
          else
            keyObjectFull.text += "(Z -> A)"
        else
          if keyObject.key in ["lastFileCreatedOn", "createdOn"]
            keyObjectFull.text += tLeastRecent
          else
            keyObjectFull.text += "(A -> Z)"
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
