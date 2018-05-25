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
  risks: ENUMS.RISK.CHOICES.slice(0, -1),

  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  tSuccessfullyOverridden: t("successfullyOverridden"),
  tSuccessfullyIgnored: t("successfullyIgnored"),
  tSuccessfullyReset: t("successfullyReset"),

  filteredRisks: (function() {
    const risks = this.get("risks");
    const analysisRisk = this.get("analysis.computedRisk");
    return risks.filter(risk => analysisRisk !== risk.value);
  }).property("risks", "analysis.computedRisk"),

  markedRisk: (function() {
    const filteredRisks = this.get("filteredRisks");
    return filteredRisks[0].value;
  }).property("filteredRisks"),

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

    selectIgnoredAnalyisType() {
      const ignoreAllAnalyses = Boolean(this.$('#ignored-analysis-all')[0].value);
      this.set("ignoreAllAnalyses", ignoreAllAnalyses);
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

    ignoreAnalysis() {
      this.set("ignoreAnalysis", true);
      this.send("ignoreAnalysisRequest");
    },

    doNotIgnoreAnalysis() {
      this.set("ignoreAnalysis", false);
      this.send("ignoreAnalysisRequest");
    },

    editMarkedAnalysis() {
      this.set("isEditingOverriddenRisk", true);
    },

    cancelEditMarkingAnalysis() {
      this.set("isEditingOverriddenRisk", false);
    },

    ignoreAnalysisRequest() {
      const ignoreAllAnalyses = this.get("ignoreAllAnalyses");
      const url = this.editAnalysisURL("ignore");
      const data = {
        ignore: this.get("ignoreAnalysis"),
        all: ignoreAllAnalyses
      };
      this.set("isIgnoringAnalysis", true);
      this.get("ajax").put(url, {
        data
      }).then(() => {
        if(!this.isDestroyed) {
          this.get("notify").success(this.get("tSuccessfullyIgnored"));
          this.set("isIgnoringAnalysis", false);
          if(this.get("analysis.isIgnored")) {
            this.set("analysis.isIgnored", false);
          }
          else {
            this.set("analysis.isIgnored", true);
          }
        }
      }, (error) => {
        this.get("notify").error(error.payload.message);
        this.set("isIgnoringAnalysis", false);
      });
    },

    resetMarkedAnalysis() {
      const ignoreAllAnalyses = this.get("ignoreAllAnalyses");
      const url = this.editAnalysisURL("risk");
      const data = {
        all: ignoreAllAnalyses
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
