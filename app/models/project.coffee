`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`
`import Ember from 'ember'`
`import { translationMacro as t } from 'ember-i18n'`

Project = DS.Model.extend BaseModelMixin,
  i18n: Ember.inject.service()
  owner: DS.belongsTo 'user', inverse: 'ownedProjects'
  files: DS.hasMany 'file', inverse:'project'
  name: DS.attr 'string'
  packageName: DS.attr 'string'
  platform: DS.attr 'number'
  source: DS.attr 'number'
  collaborations: DS.hasMany 'collaboration', inverse: 'project'
  githubRepo: DS.attr 'string'
  jiraProject: DS.attr 'string'
  testUser:DS.attr 'string'
  testPassword: DS.attr 'string'
  url: DS.attr 'string'
  lastFileCreatedOn: DS.attr 'date'
  fileCount: DS.attr 'number'
  deviceType: DS.attr 'number'
  platformVersion: DS.attr 'string'
  apiUrlFilters: DS.attr 'string'

  apiUrlFilterItems:(->
    apiUrlFilters = @get "apiUrlFilters"
    apiUrlFilters?.split ","
  ).property "apiUrlFilters"

  isRunDisabled: (->
    apiUrlFilters = @get "apiUrlFilters"
    if Ember.isEmpty apiUrlFilters
      "disabled"
  ).property "apiUrlFilters"

  hasAPIURLFilter: (->
    apiUrlFilters = @get "apiUrlFilters"
    if !Ember.isEmpty apiUrlFilters
      return true
  ).property "apiUrlFilters"

  addNewAPIURL: ->
    apiUrlFilters = @get "apiUrlFilters"
    @set "apiUrlFilters", apiUrlFilters.concat(",")

  removeUrl: (deletedURL) ->
    deletedURL.remove()

  tNoPreference: t("noPreference")

  pdfPassword: (->
    uuid = @get "uuid"
    if Ember.isEmpty uuid
      "Unknown!"
    else
      uuid.split("-")[4]
  ).property "uuid"

  versionText: (->
    platformVersion = @get "platformVersion"
    tNoPreference = @get "tNoPreference"
    if platformVersion is "0"
      tNoPreference
    else
      platformVersion
  ).property "platformVersion"

  hasFiles: Ember.computed.gt 'fileCount', 0
  hasMultipleFiles: Ember.computed.gt 'fileCount', 1

  platformIconClass:( ->
    switch @get "platform"
      when ENUMS.PLATFORM.ANDROID then "android"
      when ENUMS.PLATFORM.IOS then "apple"
      when ENUMS.PLATFORM.WINDOWS then "windows"
      else "mobile"
  ).property "platform"

  isAPIScanEnabled: ( ->
    platform = @get "platform"
    platform in [ENUMS.PLATFORM.ANDROID , ENUMS.PLATFORM.IOS]
  ).property "platform"

  lastFile:( ->
    params =
      projectId: @get "id"
      lastFileOnly: true
    @store.queryRecord "file", params
  ).property "fileCount"


`export default Project`
