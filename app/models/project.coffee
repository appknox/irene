`import DS from 'ember-data';`
`import BaseModelMixin from 'irene/mixins/base-model';`
`import ENUMS from 'irene/enums'`
`import Ember from 'ember'`

Project = DS.Model.extend BaseModelMixin,
  owner: DS.belongsTo 'user', inverse: 'projects', async:false
  name: DS.attr 'string'
  packageName: DS.attr 'string'
  platform: DS.attr 'number'
  source: DS.attr 'string'
  version: DS.attr 'string'
  files: DS.hasMany 'file', inverse: 'project', async:false
  fileCount: DS.attr 'number'
  githubRepo: DS.attr 'string'

  sortProperties: ["updatedOn:desc"]
  sortedFiles: Ember.computed.sort 'files', 'sortProperties'

  platformIconClass:( ->
    switch @get "platform"
      when ENUMS.PLATFORM.ANDROID then "android"
      when ENUMS.PLATFORM.IOS then "apple"
      when ENUMS.PLATFORM.WINDOWS then "windows"
      else "mobile"
  ).property "platform"

  lastFile:( ->
    files = @get "files"
    if !Ember.isEmpty files
      files.sortBy('createdOn:desc')[0]
  ).property "files.@each"

  canDoDynamicScan:(->
    ENUMS.PLATFORM.ANDROID is @get "platform"
  ).property 'platform'

  hasMultipleFiles:( ->
    fileCount = @get "fileCount"
    fileCount > 1
  ).property "fileCount"

`export default Project;`
