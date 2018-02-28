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
