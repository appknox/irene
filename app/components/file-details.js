import Ember from 'ember';
import ENUMS from 'irene/enums';

const { keys } = Object;

const FileDetailsComponent = Ember.Component.extend({

  vulnerabilityType: ENUMS.VULNERABILITY_TYPE.UNKNOWN,
  vulnerabilityTypes: ENUMS.VULNERABILITY_TYPE.CHOICES.slice(0, -1),

  analyses: (function() {
    return this.get("file.sortedAnalyses");
  }).property("file.sortedAnalyses"),

  filteredAnalysis: Ember.computed('analyses', 'vulnerabilityType',  function() {
    const vulnerabilityType = parseInt(this.get("vulnerabilityType"));
    const analyses = this.get("analyses");
    if (vulnerabilityType === ENUMS.VULNERABILITY_TYPE.UNKNOWN) {
      return analyses;
    }
    const filteredAnalysis = [];
    for (let analysis of analyses) {
      if (analysis.hasType(vulnerabilityType)) {
        filteredAnalysis.push(analysis);
      }
    }
    return filteredAnalysis;
  }),

  actions: {
    filterVulnerabilityType() {
      const select = $(this.element).find("#filter-vulnerability-type");
      this.set("vulnerabilityType", select.val());
    }
  }
});

export default FileDetailsComponent;
