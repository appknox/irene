import Ember from 'ember';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';

const AnalysisDetailsComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  analysis: null,
  tagName: "article",
  mpClassSelector: true,
  classNames: ["message"],
  showVulnerability: false,
  classNameBindings: ["riskClass"],
  risks: ENUMS.RISK.CHOICES.slice(0, -1),

  filteredRisks: (function() {
    const risks = this.get("risks");
    const analysisRisk = this.get("analysis.risk");
    return risks.filter(risk => analysisRisk !== risk.value);
  }).property("risks", "analysis.risk"),

  markedRisk: (function() {
    const filteredRisks = this.get("filteredRisks");
    return filteredRisks[0].value;
  }).property("filteredRisks"),

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

  editAnalysisURL(type) {
    const fileId = this.get("analysis.file.id");
    const vulnerabilityId = this.get("analysis.vulnerability.id");
    const url = [ENV.endpoints.files, fileId, ENV.endpoints.vulnerabilityPreferences, vulnerabilityId, type].join('/');
    return url;
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
        this.get("notify").success("Successfully marked the analysis");
        this.set("isMarkingAnalysis", false);
        this.set("isEditingOverriddenRisk", false);
        this.set("analysis.overriddenRisk", markedRisk);
        this.set("analysis.isOverriddenRisk", true);
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
        this.get("notify").success("Successfully ignored the analysis");
        this.set("isIgnoringAnalysis", false);
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
        this.get("notify").success("Successful");
        this.set("isResettingMarkedAnalysis", false);
        this.set("analysis.isOverriddenRisk", false);
      }, (error) => {
        this.get("notify").error(error.payload.message);
        this.set("isResettingMarkedAnalysis", false);
      });
    }
  }
});

export default AnalysisDetailsComponent;
