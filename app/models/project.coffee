`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`
`import Ember from 'ember'`

Project = DS.Model.extend
  owner: DS.belongsTo 'user', inverse: 'ownedProjects', async: false
  name: DS.attr 'string'
  packageName: DS.attr 'string'
  platform: DS.attr 'string'
  source: DS.attr 'string'
  version : DS.attr 'string'
  files: DS.hasMany 'file', inverse :'project'
  collaboration: DS.hasMany 'collaboration', inverse: 'project', async: false
  fileCount: DS.attr 'string'
  githubRepo: DS.attr 'string'
  jiraProject: DS.attr 'string'
  testUser:DS.attr 'string'
  testPassword: DS.attr 'string'

`export default Project`
