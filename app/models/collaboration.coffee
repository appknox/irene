`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixin/base-model'`
`import ENUMS from 'irene/enums'`

Collaboration = DS.Model.extend

  project : DS.belongsTo 'project', inverse: 'collaboration', async: false
  user : DS.belongsTo 'user', inverse: 'collaboration', async:false
  role : DS.attr 'number'

`export default Collaboration`
