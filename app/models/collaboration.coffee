`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model';`

Collaboration = DS.Model.extend BaseModelMixin,

  project: DS.belongsTo 'project', inverse: 'collaborations', async:false
  user: DS.belongsTo 'user', inverse: 'collaborations', async:false
  role: DS.attr 'number'

`export default Collaboration`
