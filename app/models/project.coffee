`import DS from 'ember-data';`
`import BaseModelMixin from '../mixins/base-model';`

Project = DS.Model.extend BaseModelMixin,
  owner: DS.belongsTo 'user', async: true, inverse: 'projects'
  name: DS.attr 'string'
  packageName: DS.attr 'string'
  platform: DS.attr 'number'
  source: DS.attr 'string'
  version: DS.attr 'string'
  lastFile: DS.belongsTo 'file', async: true
  files: DS.hasMany 'file', async:true, inverse: 'project'

`export default Project;`
