/* eslint-disable ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects, ember/require-return-from-computed, ember/no-get */
import { computed } from '@ember/object';
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import ENUMS from 'irene/enums';

export default Model.extend({
  name: attr('string'),
  user: belongsTo('user'),
  apiScanStatus: attr('number'),
  project: belongsTo('security/project'),
  analyses: hasMany('security/analysis'),

  analysesSorting: ['risk:desc'],
  sortedAnalyses: computed.sort('analyses', 'analysesSorting'),

  isApiDone: computed('apiScanStatus', function () {
    const apiScanStatus = this.get('apiScanStatus');
    if (apiScanStatus === ENUMS.SCAN_STATUS.COMPLETED) {
      return true;
    }
  }),
  isDynamicDone: attr('boolean'),
  isStaticDone: attr('boolean'),
  manual: attr('number'),
});
