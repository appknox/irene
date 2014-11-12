`import DS from 'ember-data'`
`import BaseModelMixin from '../mixins/base-model'`

Project = DS.Model.extend BaseModelMixin,
  owner: DS.attr 'number'
  name: DS.attr 'string'
  packageName: DS.attr 'string'
  uuid: DS.attr 'string'
  platform: DS.attr 'number'
  source: DS.attr 'string'
  version: DS.attr 'string'

`export default Project`
