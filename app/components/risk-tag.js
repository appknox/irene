import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';

export default Component.extend({
  analysis: null,
  i18n: service(),

  tScanning: t("scanning"),
  tUntested: t("untested"),
  tRequested: t("requested"),

  isNonPassedRiskOverridden: computed('analysis.{risk,overriddenRisk}', function() {
    return this.get('analysis.overriddenRisk') != null && this.get('analysis.risk') != ENUMS.RISK.NONE;
  }),

  scanningText: computed(
    "analysis.vulnerability.types",
    "analysis.file.{dynamicStatus,manual,apiScanProgress}", function() {
    const tScanning = this.get("tScanning");
    const tUntested = this.get("tUntested");
    const tRequested = this.get("tRequested");
    const types = this.get("analysis.vulnerability.types");
    if (types === undefined) { return []; }
    switch (types[0]) {
      case ENUMS.VULNERABILITY_TYPE.STATIC: {
        return tScanning;
      }
      case ENUMS.VULNERABILITY_TYPE.DYNAMIC: {
        const dynamicStatus = this.get('analysis.file.dynamicStatus');
        if(dynamicStatus !== ENUMS.DYNAMIC_STATUS.NONE) {
          return tScanning;
        }
        return tUntested;
      }
      case ENUMS.VULNERABILITY_TYPE.MANUAL: {
        if(this.get("analysis.file.manual")) {
          return tRequested;
        }
        return tUntested;
      }
      case ENUMS.VULNERABILITY_TYPE.API: {
        const apiScanProgress = this.get('analysis.file.apiScanProgress');
        if(apiScanProgress >= 1) {
          return tScanning;
        }
        return tUntested;
      }
    }
  })
});
