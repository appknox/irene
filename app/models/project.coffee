`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`
`import Ember from 'ember'`

Project = DS.Model.extend BaseModelMixin,

  owner: DS.belongsTo 'user', inverse: 'ownedProjects'
  name: DS.attr 'string'
  packageName: DS.attr 'string'
  platform: DS.attr 'number'
  source: DS.attr 'number'
  version : DS.attr 'string'
  files: DS.hasMany 'file', inverse :'project'
  lastFile: DS.belongsTo 'file',  inverse :'project'
  collaboration: DS.hasMany 'collaboration', inverse: 'project'
  fileCount: DS.attr 'number'
  githubRepo: DS.attr 'string'
  jiraProject: DS.attr 'string'
  testUser:DS.attr 'string'
  testPassword: DS.attr 'string'

`export default Project`
