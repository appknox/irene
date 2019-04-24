import { computed } from '@ember/object';
import DS from 'ember-data';
import ENUMS from 'irene/enums';

export default DS.Model.extend({
  name: DS.attr('string'),
  user: DS.belongsTo('user'),
  apiScanStatus: DS.attr('number'),
  project: DS.belongsTo('security/project'),
  analyses: DS.hasMany('security/analysis'),

  analysesSorting: ['risk:desc'],
  sortedAnalyses: computed.sort('analyses', 'analysesSorting'),

  isApiDone: computed('apiScanStatus', function() {
    const apiScanStatus = this.get("apiScanStatus");
    if(apiScanStatus === ENUMS.SCAN_STATUS.COMPLETED) return true;
  }),
  isDynamicDone: DS.attr('boolean'),
  isStaticDone: DS.attr('boolean'),
  manual: DS.attr('number'),

});
