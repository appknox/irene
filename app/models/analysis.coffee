`import DS from 'ember-data';`

Analysis = DS.Model.extend
  file: DS.belongsTo 'file', inverse: 'analyses'
  description: DS.attr 'string'
  extraDesc: DS.attr 'string'
  analiserVersion: DS.attr 'number'
  risk: DS.attr 'number'
  status: DS.attr 'number'

`export default Analysis;`
