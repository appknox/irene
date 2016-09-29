`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`

Collaboration = DS.Model.extend

  project : DS.belongsTo 'project', inverse: 'collaboration'
  user : DS.belongsTo 'user', inverse: 'collaboration'
  role : DS.attr 'number'

`export default Collaboration`
