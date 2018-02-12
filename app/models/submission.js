/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import DS from 'ember-data';
import BaseModeMixin from 'irene/mixins/base-model';
import ENUMS from 'irene/enums';

const Submission = DS.Model.extend(BaseModeMixin, {

  user: DS.belongsTo('user', {inverse: 'submissions'}),
  metaData: DS.attr('string'),
  status: DS.attr('number'),
  reason:DS.attr('string'),
  source: DS.attr('number'),
  packageName: DS.attr('string'),
  statusHumanized: DS.attr('string'),


  hasReason: (function() {
    const reason = this.get("reason");
    return (reason != null ? reason.length : undefined) > 0;
  }).property("reason")
}
);

export default Submission;
