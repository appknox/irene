import Model, { attr, belongsTo }  from '@ember-data/model';
import BaseModeMixin from 'irene/mixins/base-model';
import { computed } from '@ember/object';

const Submission = Model.extend(BaseModeMixin, {
  user: belongsTo('user', {inverse: 'submissions'}),
  metaData: attr('string'),
  status: attr('number'),
  reason:attr('string'),
  source: attr('number'),
  packageName: attr('string'),
  statusHumanized: attr('string'),

  hasReason: computed('reason', function() {
    const reason = this.get("reason");
    return (reason != null ? reason.length : undefined) > 0;
  })
});

export default Submission;
