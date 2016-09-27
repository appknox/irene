`import DS from 'ember-data'`
`import BaseModeMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`

Submission = DS.Model.extend
  user: DS.belongsTo 'user', inverse: 'submission', async:false
  metaData: DS.attr 'string'
  status: DS.attr 'number'
  reason:DS.attr 'string'
  source: DS.attr 'number'
  package: DS.attr 'string'
  statusHumanized: DS.attr 'string'

`export default Submission`
