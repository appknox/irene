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
  version : DS.attr 'string'
  collaborations: DS.hasMany 'collaborations', inverse: 'project'
  githubRepo: DS.attr 'string'
  jiraProject: DS.attr 'string'
  testUser:DS.attr 'string'
  testPassword: DS.attr 'string'
  url: DS.attr 'string'

  fileCount: Ember.computed.alias 'files.length'
  hasFiles: Ember.computed.gt 'fileCount', 0
  hasMultipleFiles: Ember.computed.gt 'fileCount', 1

`export default Project`
