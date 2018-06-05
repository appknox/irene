import Ember from 'ember';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({
  analysis: null,
  i18n: Ember.inject.service(),

  tScanning: t("scanning"),
  tUntested: t("untested"),
  tRequested: t("requested"),

  scanningText: (function() {
    const tScanning = this.get("tScanning");
    const tUntested = this.get("tUntested");
    const tRequested = this.get("tRequested");
    const types = this.get("analysis.vulnerability.types");
    if (types === undefined) { return []; }
    switch (types[0]) {
      case ENUMS.VULNERABILITY_TYPE.STATIC:
        return tScanning;
      case ENUMS.VULNERABILITY_TYPE.DYNAMIC:
        const dynamicStatus = this.get('analysis.file.dynamicStatus');
        if(dynamicStatus !== ENUMS.DYNAMIC_STATUS.NONE) {
          return tScanning;
        }
        else {
          return tUntested;
        }
        break;
      case ENUMS.VULNERABILITY_TYPE.MANUAL:
        if(this.get("analysis.file.manual")) {
          return tRequested;
        }
        else {
          return tUntested;
        }
        break;
      case ENUMS.VULNERABILITY_TYPE.API:
        const apiScanProgress = this.get('analysis.file.apiScanProgress');
        if(apiScanProgress >= 1) {
          return tScanning;
        }
        else {
          return tUntested;
        }
        break;
    }
  }).property(
    "analysis.vulnerability.types",
    "analysis.file.dynamicStatus",
    "analysis.file.manual",
    "analysis.file.apiScanProgress"
  )
});
