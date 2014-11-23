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

  stat:(->
    [
      { title: "Critical",         value : 180,  color: "#FB4A46" }
      { title: "Success", value:  60,   color: "#80C081" }
      { title: "Info",        value : 50,   color: "#2CC2F8" }
      { title: "Warning",      value:  30,   color: "#FCD630" }
      { title: "Processing",        value : 20,   color: "#6B6B6B" }
    ]
  ).property()

`export default Project;`
