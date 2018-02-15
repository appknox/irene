import Ember from 'ember';
import ENUMS from 'irene/enums';

const AnalysisDetailsComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  analysis: null,
  tagName: "article",
  classNames: ["message"],
  showVulnerability: false,
  classNameBindings: ["riskClass"],
  mpClassSelector: true,

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
    }
  }
});



export default AnalysisDetailsComponent;
