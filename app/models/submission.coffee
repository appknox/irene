`import DS from 'ember-data'`
`import BaseModeMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`

Submission = DS.Model.extend BaseModeMixin,

  user: DS.belongsTo 'user', inverse: 'submissions'
  metaData: DS.attr 'string'
  status: DS.attr 'number'
  reason:DS.attr 'string'
  source: DS.attr 'number'
  packageName: DS.attr 'string'
  statusHumanized: DS.attr 'string'


  hasReason: (->
    reason = @get "reason"
    reason?.length > 0
  ).property "reason"

`export default Submission`
