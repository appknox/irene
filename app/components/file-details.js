import Ember from 'ember';
import ENUMS from 'irene/enums';

const FileDetailsComponent = Ember.Component.extend({

  vulnerabilityType: ENUMS.VULNERABILITY_TYPE.UNKNOWN,
  vulnerabilityTypes: ENUMS.VULNERABILITY_TYPE.CHOICES.slice(0, -1),

  analyses: (function() {
    return this.get("file.sortedAnalyses");
  }).property("file.sortedAnalyses"),

  sortImpactAscending: false,

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
    return this.set("analyses", filteredAnalysis);
  }),

  sortedAnalyses: Ember.computed.sort('analyses', 'analysesSorting'),

  actions: {
    filterVulnerabilityType() {
      this.set("analyses", this.get("file.sortedAnalyses"));
      this.set("sortImpactAscending", false);
      const select = $(this.element).find("#filter-vulnerability-type");
      this.set("vulnerabilityType", select.val());
    },

    sortImpact() {
      const sortImpactAscending = this.get("sortImpactAscending");
      if(!sortImpactAscending) {
        this.set("analysesSorting", ['risk:asc']);
        this.set("sortImpactAscending", true);
      }
      else {
        this.set("analysesSorting", ['risk:desc']);
        this.set("sortImpactAscending", false);
      }
      const sortedAnalyses = this.get("sortedAnalyses");
      this.set("analyses", sortedAnalyses);
    }
  }
});

export default FileDetailsComponent;
