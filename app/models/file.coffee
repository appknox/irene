`import DS from 'ember-data'`

File = DS.Model.extend
  project: DS.belongsTo 'project', inverse: 'files'

`export default File`
