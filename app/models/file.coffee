`import DS from 'ember-data';`
`import BaseModelMixin from '../mixins/base-model';`

File = DS.Model.extend BaseModelMixin,
  project: DS.belongsTo 'project', inverse: 'files'
  version: DS.attr 'string'
  iconUrl: DS.attr 'string'
  md5hash: DS.attr 'string'
  sha1hash: DS.attr 'string'
  name: DS.attr 'string'
  color: DS.attr 'string'

`export default File;`
