`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`

Analysis = DS.Model.extend
  file: DS.belongsTo 'file', inverse: 'analysis'
  description: DS.attr()
  analiserVersion: DS.attr 'number'
  risk: DS.attr 'number'
  vulnerability: DS.belongsTo 'vulnerability'

`export default Analysis`
