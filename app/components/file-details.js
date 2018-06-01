import Ember from 'ember';
import ENUMS from 'irene/enums';

const FileDetailsComponent = Ember.Component.extend({

  sortImpactAscending: false,

  vulnerabilityType: ENUMS.VULNERABILITY_TYPE.UNKNOWN,
  vulnerabilityTypes: ENUMS.VULNERABILITY_TYPE.CHOICES.slice(0, -1),

  analyses: (function() {
    return this.get("file.sortedAnalyses");
  }).property("file.sortedAnalyses"),

  analysesObserver: Ember.observer('analyses.@each.isIgnored', function() {
    this.updateHiddenAnalysis();
    this.updateUnhiddenAnalysis();
  }),

  updateHiddenAnalysis() {
    const hiddenAnalyses = this.sortHiddenAnalyses();
    this.set("sortedHiddenAnalyses", hiddenAnalyses);
  },

  updateUnhiddenAnalysis() {
    const unhiddenAnalyses = this.sortUnhiddenAnalyses();
    this.set("sortedUnhiddenAnalyses", unhiddenAnalyses);
  },

  sortUnhiddenAnalyses() {
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
  },

  sortHiddenAnalyses() {
    const analyses = this.get("file.sortedAnalyses");
    const ignoredAnalyses = [];
    for (let analysis of analyses) {
      if (analysis.get("isIgnored")) {
        ignoredAnalyses.push(analysis);
      }
    }
    return ignoredAnalyses;
  },

  sortedUnhiddenAnalyses: (function() {
    return this.sortUnhiddenAnalyses();
  }).property(),

  sortedHiddenAnalyses: (function() {
    return this.sortHiddenAnalyses();
  }).property(),

  sortedAnalyses: Ember.computed.sort('sortedUnhiddenAnalyses', 'analysesSorting'),

  actions: {
    filterVulnerabilityType() {
      this.set("analyses", this.get("file.sortedAnalyses"));
      this.set("sortImpactAscending", false);
      const select = $(this.element).find("#filter-vulnerability-type");
      this.set("vulnerabilityType", select.val());
      this.updateUnhiddenAnalysis();
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
      this.set("sortedUnhiddenAnalyses", sortedAnalyses);
    }
  }
});

export default FileDetailsComponent;
