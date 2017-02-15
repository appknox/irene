`import DS from 'ember-data'`

Report = DS.Model.extend

  file: DS.belongsTo 'file'

`export default Report`
