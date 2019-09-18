import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

export default Component.extend({
  analysis: null,
  intl: service(),

  isNonPassedRiskOverridden: computed('analysis.{risk,overriddenRisk}', function() {
    return this.get('analysis.overriddenRisk') != null && this.get('analysis.risk') != ENUMS.RISK.NONE;
  }),

  analysisRiskStatus: computed('analysis.{computedRisk,status,isOverriddenRisk}', function() {
    return analysisRiskStatus([
      this.get('analysis.computedRisk'),
      this.get('analysis.status'),
      this.get('analysis.isOverriddenRisk'),
    ]);
  }),
});
