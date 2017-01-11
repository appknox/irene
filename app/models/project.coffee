`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`
`import Ember from 'ember'`

Project = DS.Model.extend BaseModelMixin,

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

  pdfPassword: (->
    uuid = @get "uuid"
    if Ember.isEmpty uuid
      "Unknown!"
    else
      uuid.split("-")[4]
  ).property "uuid"

  hasFiles: Ember.computed.gt 'fileCount', 0
  hasMultipleFiles: Ember.computed.gt 'fileCount', 1

  platformIconClass:( ->
    switch @get "platform"
      when ENUMS.PLATFORM.ANDROID then "android"
      when ENUMS.PLATFORM.IOS then "apple"
      when ENUMS.PLATFORM.WINDOWS then "windows"
      else "mobile"
  ).property "platform"

  lastFile:( ->
    params =
      projectId: @get "id"
      lastFileOnly: true
    @store.queryRecord "file", params
  ).property "fileCount"


`export default Project`
