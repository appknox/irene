import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import {
  t
} from 'ember-intl';
import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';
import {
  computed
} from '@ember/object';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const AnalysisDetailsComponent = Component.extend({
  analysis: null,
  tagName: "article",
  mpClassSelector: true,
  classNames: ["message"],
  showVulnerability: false,
  classNameBindings: ["riskClass"],

  intl: service(),
  ajax: service(),
  notify: service('notifications'),

  tSuccessfullyOverridden: t("successfullyOverridden"),
  tSuccessfullyReset: t("successfullyReset"),
  tRiskAndCommentRequired: t("riskAndCommentRequired"),

  risks: computed(function () {
    const risks = ENUMS.RISK.CHOICES;
    const riskFilter = [ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN];
    return risks.filter(risk => !riskFilter.includes(risk.value));
  }),

  filteredRisks: computed("risks", "analysis.risk", function () {
    const risks = this.get("risks");
    const analysisRisk = this.get("analysis.risk");
    return risks.filter(risk => analysisRisk !== risk.value);
  }),

  markedRisk: computed("filteredRisks", function () {
    const filteredRisks = this.get("filteredRisks");
    return filteredRisks[0].value;
  }),

  statusClass: computed("analysis.{status,computedRisk}", function () {
    const status = this.get("analysis.status");
    if (status === ENUMS.ANALYSIS.WAITING) {
      return "is-waiting"
    }
    if (status === ENUMS.ANALYSIS.RUNNING) {
      return "is-progress"
    }
    if (status === ENUMS.ANALYSIS.ERROR) {
      return "is-errored"
    }
    const risk = this.get("analysis.computedRisk");
    if (risk === ENUMS.RISK.UNKNOWN) {
      return "is-untested"
    }
    return "is-completed";
  }),

  editAnalysisURL(type) {
    const fileId = this.get("analysis.file.id");
    const vulnerabilityId = this.get("analysis.vulnerability.id");
    const url = [ENV.endpoints.files, fileId, ENV.endpoints.vulnerabilityPreferences, vulnerabilityId, type].join('/');
    return url;
  },

  confirmCallback() {
    this.send("resetMarkedAnalysis");
  },

  tags: computed(
    "analysis.vulnerability.types",
    "analysis.file.{isStaticDone,isDynamicDone,isManualDone,isApiDone}",
    function () {
      const types = this.get("analysis.vulnerability.types");
      if (types === undefined) {
        return [];
      }
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
    }
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
      this.set("analysis.overriddenRiskComment", null);
    },

    markAnalysis() {
      const markedRisk = this.get("markedRisk");
      const comment = this.get("analysis.overriddenRiskComment");
      if (!markedRisk || !comment) {
        this.get("notify").error(this.get("tRiskAndCommentRequired"));
        return;
      }
      const markAllAnalyses = this.get("markAllAnalyses");
      const url = this.editAnalysisURL("risk");
      const data = {
        risk: markedRisk,
        comment: comment,
        all: markAllAnalyses
      };
      this.set("isMarkingAnalysis", true);
      this.get("ajax").put(url, {
        data
      }).then(() => {
        triggerAnalytics('feature', ENV.csb.editAnalysis);
        if (!this.isDestroyed) {
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
        if (!this.isDestroyed) {
          this.get("notify").success(this.get("tSuccessfullyReset"));
          this.set("isResettingMarkedAnalysis", false);
          this.set("showResetAnalysisConfirmBox", false);
          this.set("analysis.isOverriddenRisk", false);
          this.set("analysis.computedRisk", this.get("analysis.risk"));
          this.set("analysis.overriddenRiskComment", null);
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
