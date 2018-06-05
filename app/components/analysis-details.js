import Ember from 'ember';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';

const AnalysisDetailsComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  analysis: null,
  tagName: "article",
  classNames: ["message"],
  showVulnerability: false,
  classNameBindings: ["riskClass"],
  mpClassSelector: true,

  tScanning: t("scanning"),
  tUntested: t("untested"),
  tRequested: t("requested"),

  riskClass: ( function() {
      const risk = this.get("analysis.risk");
      switch (risk) {
        case ENUMS.RISK.NONE:
          return "is-success";
        case ENUMS.RISK.LOW:
          return "is-info";
        case ENUMS.RISK.MEDIUM:
          return "is-warning";
        case ENUMS.RISK.HIGH:
          return "is-danger";
        case ENUMS.RISK.CRITICAL:
          return "is-critical";
      }
    }).property("analysis.risk"),

  progressClass: ( function() {
    const risk = this.get("analysis.risk");
    switch (risk) {
      case ENUMS.RISK.UNKNOWN:
        return "is-progress";
    }
  }).property("analysis.risk"),

  tags: (function() {
    const types = this.get("analysis.vulnerability.types");
    if (types === undefined) { return []; }
    const tags = [];
    for (let type of Array.from(types)) {
      if (type === ENUMS.VULNERABILITY_TYPE.STATIC) {
        tags.push({
          status: this.get("analysis.file.isStaticDone"),
          text: "static"
        });
      }
      if (type === ENUMS.VULNERABILITY_TYPE.DYNAMIC) {
        tags.push({
          status: this.get("analysis.file.isDynamicDone"),
          text: "dynamic"
        });
      }
      if (type === ENUMS.VULNERABILITY_TYPE.MANUAL) {
        tags.push({
          status: this.get("analysis.file.isManualDone"),
          text: "manual"
        });
      }
      if (type === ENUMS.VULNERABILITY_TYPE.API) {
        tags.push({
          status: this.get("analysis.file.isApiDone"),
          text: "api"
        });
      }
    }
    return tags;
  }).property(
    "analysis.vulnerability.types",
    "analysis.file.isStaticDone",
    "analysis.file.isDynamicDone",
    "analysis.file.isManualDone",
    "analysis.file.isApiDone"
  ),

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
  ),

  actions: {

    toggleVulnerability() {
      this.set("mpClassSelector", this.get("showVulnerability"));
      this.set("showVulnerability", !this.get("showVulnerability"));
    }
  }
});

export default AnalysisDetailsComponent;
