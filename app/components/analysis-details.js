import Ember from 'ember';
import ENUMS from 'irene/enums';

const AnalysisDetailsComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  analysis: null,
  tagName: "article",
  mpClassSelector: true,
  classNames: ["message"],
  showVulnerability: false,
  classNameBindings: ["riskClass"],
  showChangeAnalysisSettings: false,
  risks: ENUMS.RISK.CHOICES.slice(0, -1),

  filteredRisks: (function() {
    const risks = this.get("risks");
    const analysisRisk = this.get("analysis.risk");
    return risks.filter(risk => analysisRisk !== risk.value);
  }).property("risks", "analysis.risk"),

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

  actions: {

    toggleVulnerability() {
      this.set("mpClassSelector", this.get("showVulnerability"));
      this.set("showVulnerability", !this.get("showVulnerability"));
    },

    openEditAnalysisModal() {
      this.set("showEditAnalysisModal", true);
    },

    selectMarkedAnalyis() {
      this.set("showChangeAnalysisSettings", true);
      const isMarked = parseInt(this.$('#marked-analysis')[0].value);
    },
    ignoreAnalysis() {
      const isChecked = this.$('#ignore-analysis')[0].checked;
      this.set("analysis.isIgnored", isChecked);
    }
  }
});

export default AnalysisDetailsComponent;
