`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model';`

Activity = DS.Model.extend BaseModelMixin
  activityType: DS.attr 'number'

`export default Activity`
