import Ember from 'ember';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const AnalysisDetailsComponent = Ember.Component.extend({
  analysis: null,
  tagName: "article",
  mpClassSelector: true,
  classNames: ["message"],
  showVulnerability: false,
  classNameBindings: ["riskClass"],

  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  tSuccessfullyOverridden: t("successfullyOverridden"),
  tSuccessfullyReset: t("successfullyReset"),

  risks: (function() {
    const risks = ENUMS.RISK.CHOICES;
    const riskFilter = [ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN];
    return risks.filter(risk => !riskFilter.includes(risk.value));
  }).property(),

  filteredRisks: (function() {
    const risks = this.get("risks");
    const analysisRisk = this.get("analysis.risk");
    return risks.filter(risk => analysisRisk !== risk.value);
  }).property("risks", "analysis.risk"),

  markedRisk: (function() {
    const filteredRisks = this.get("filteredRisks");
    return filteredRisks[0].value;
  }).property("filteredRisks"),

  tScanning: t("scanning"),
  tUntested: t("untested"),
  tRequested: t("requested"),

  riskClass: ( function() {
    const risk = this.get("analysis.computedRisk");
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
  }).property("analysis.computedRisk"),

  progressClass: ( function() {
    const risk = this.get("analysis.computedRisk");
    switch (risk) {
      case ENUMS.RISK.UNKNOWN:
        return "is-progress";
    }
  }).property("analysis.computedRisk"),

  editAnalysisURL(type) {
    const fileId = this.get("analysis.file.id");
    const vulnerabilityId = this.get("analysis.vulnerability.id");
    const url = [ENV.endpoints.files, fileId, ENV.endpoints.vulnerabilityPreferences, vulnerabilityId, type].join('/');
    return url;
  },

  confirmCallback() {
    this.send("resetMarkedAnalysis");
  },

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
    },

    openEditAnalysisModal() {
      this.set("showEditAnalysisModal", true);
    },

    selectMarkedAnalyis() {
      const markedRisk = parseInt(this.$('#marked-analysis')[0].value);
      this.set("markedRisk", markedRisk);
    },

    selectMarkedAnalyisType() {
      const markAllAnalyses = Boolean(this.$('#marked-analysis-all')[0].value);
      this.set("markAllAnalyses", markAllAnalyses);
    },

    removeMarkedAnalysis() {
      this.set("analysis.overriddenRisk", null);
    },

    markAnalysis() {
      const markedRisk = this.get("markedRisk");
      const markAllAnalyses = this.get("markAllAnalyses");
      const url = this.editAnalysisURL("risk");
      const data = {
        risk: markedRisk,
        all: markAllAnalyses
      };
      this.set("isMarkingAnalysis", true);
      this.get("ajax").put(url, {
        data
      }).then(() => {
        if(!this.isDestroyed) {
          this.get("notify").success(this.get("tSuccessfullyOverridden"));
          this.set("isMarkingAnalysis", false);
          this.set("isEditingOverriddenRisk", false);
          this.set("analysis.overriddenRisk", markedRisk);
          this.set("analysis.computedRisk", markedRisk);
          this.set("analysis.isOverriddenRisk", true);
        }
      }, (error) => {
        this.get("notify").error(error.payload.message);
        this.set("isMarkingAnalysis", false);
      });
    },

    editMarkedAnalysis() {
      this.set("isEditingOverriddenRisk", true);
    },

    cancelEditMarkingAnalysis() {
      this.set("isEditingOverriddenRisk", false);
    },

    resetMarkedAnalysis() {
      const url = this.editAnalysisURL("risk");
      const data = {
        all: true
      };
      this.set("isResettingMarkedAnalysis", true);
      this.get("ajax").delete(url, {
        data
      }).then(() => {
        if(!this.isDestroyed) {
          this.get("notify").success(this.get("tSuccessfullyReset"));
          this.set("isResettingMarkedAnalysis", false);
          this.set("showResetAnalysisConfirmBox", false);
          this.set("analysis.isOverriddenRisk", false);
          this.set("analysis.computedRisk", this.get("analysis.risk"));
        }
      }, (error) => {
        this.get("notify").error(error.payload.message);
        this.set("isResettingMarkedAnalysis", false);
      });
    },
    openResetMarkedAnalysisConfirmBox() {
      this.set("showResetAnalysisConfirmBox", true);
    }
  }
});

export default AnalysisDetailsComponent;
