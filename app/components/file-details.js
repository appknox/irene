import Ember from 'ember';
import ENUMS from 'irene/enums';

const FileDetailsComponent = Ember.Component.extend({

  sortImpactAscending: false,

  vulnerabilityType: ENUMS.VULNERABILITY_TYPE.UNKNOWN,
  vulnerabilityTypes: ENUMS.VULNERABILITY_TYPE.CHOICES.slice(0, -1),

  analyses: (function() {
    return this.get("file.sortedAnalyses");
  }).property("file.sortedAnalyses"),

  sortedUnhiddenAnalyses: Ember.computed('analyses', 'vulnerabilityType',  function() {
    const vulnerabilityType = parseInt(this.get("vulnerabilityType"));
    const notIgnoredAnalyses = [];
    const analyses = this.get("analyses");
    if (vulnerabilityType === ENUMS.VULNERABILITY_TYPE.UNKNOWN) {
      for (let analysis of analyses) {
        if (analysis.get("isNotIgnored")) {
          notIgnoredAnalyses.push(analysis);
          this.set("notIgnoredAnalyses", notIgnoredAnalyses);
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

  sortedHiddenAnalyses: Ember.computed('file.sortedAnalyses', function() {
    const analyses = this.get("file.sortedAnalyses");
    const ignoredAnalyses = [];
    for (let analysis of analyses) {
      if (analysis.get("isIgnored")) {
        ignoredAnalyses.push(analysis);
      }
    }
    return ignoredAnalyses;
  }),

  sortedAnalyses: Ember.computed.sort('sortedUnhiddenAnalyses', 'analysesSorting'),

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
        this.set("analysesSorting", ['computedRisk:asc']);
        this.set("sortImpactAscending", true);
      }
      else {
        this.set("analysesSorting", ['computedRisk:desc']);
        this.set("sortImpactAscending", false);
      }
      const sortedAnalyses = this.get("sortedAnalyses");
      this.set("analyses", sortedAnalyses);
    }
  }
});

export default FileDetailsComponent;
