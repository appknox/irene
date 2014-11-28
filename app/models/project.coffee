`import DS from 'ember-data';`
`import BaseModelMixin from '../mixins/base-model';`
`import ENUMS from '../enums'`

Project = DS.Model.extend BaseModelMixin,
  owner: DS.belongsTo 'user', async: true, inverse: 'projects'
  name: DS.attr 'string'
  packageName: DS.attr 'string'
  platform: DS.attr 'number'
  source: DS.attr 'string'
  version: DS.attr 'string'
  lastFile: DS.belongsTo 'file', async: true
  files: DS.hasMany 'file', async:true, inverse: 'project'

  platformIconClass:( ->
    switch @get "platform"
      when ENUMS.PLATFORM.ANDROID then "android"
      when ENUMS.PLATFORM.IOS then "apple"
      when ENUMS.PLATFORM.WINDOWS then "windows"
      else "mobile"
  ).property "platform"

`export default Project;`
