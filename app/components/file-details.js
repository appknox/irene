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
    const notIgnoredAnalyses = [];
    const ignoredAnalyses = [];
    if (vulnerabilityType === ENUMS.VULNERABILITY_TYPE.UNKNOWN) {
      for (let analysis of analyses) {
        if (analysis.get("isNotIgnored")) {
          notIgnoredAnalyses.push(analysis);
          this.set("notIgnoredAnalyses", notIgnoredAnalyses);
        }
        else {
          ignoredAnalyses.push(analysis);
          this.set("ignoredAnalyses", ignoredAnalyses);
        }
      }
      return notIgnoredAnalyses;
    }
    const filteredAnalysis = [];
    for (let analysis of analyses) {
      if (analysis.hasType(vulnerabilityType) && analysis.get("isNotIgnored")) {
        filteredAnalysis.push(analysis);
      }
    }
    return filteredAnalysis;
  }),

  sortedAnalyses: Ember.computed.sort('notIgnoredAnalyses', 'analysesSorting'),

  actions: {
    filterVulnerabilityType() {
      this.set("analyses", this.get("file.sortedAnalyses"));
      this.set("sortImpactAscending", false);
      const select = $(this.element).find("#filter-vulnerability-type");
      this.set("vulnerabilityType", select.val());
    },

    sortByImpact() {
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
