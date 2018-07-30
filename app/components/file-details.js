import Ember from 'ember';
import ENUMS from 'irene/enums';

const FileDetailsComponent = Ember.Component.extend({

  sortImpactAscending: false,

  isSecurityEnabled: false,

  vulnerabilityType: ENUMS.VULNERABILITY_TYPE.UNKNOWN,
  vulnerabilityTypes: ENUMS.VULNERABILITY_TYPE.CHOICES.slice(0, -1),

  analyses: (function() {
    return this.get("file.sortedAnalyses");
  }).property("file.sortedAnalyses"),

  analysesObserver: Ember.observer('analyses.@each', function() {
    this.updateUnhiddenAnalysis();
  }),

  didInsertElement() {
    this.securityEnabled();
  },

  securityEnabled() {
    this.get("ajax").request("projects", {namespace: 'hudson-api'})
    .then(() => {
      this.set("isSecurityEnabled", true);
    }, () => {
      this.set("isSecurityEnabled", false);
    });
  },

  updateUnhiddenAnalysis() {
    const unhiddenAnalyses = this.sortUnhiddenAnalyses();
    this.set("sortedUnhiddenAnalyses", unhiddenAnalyses);
  },

  sortUnhiddenAnalyses() {
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
  },

  sortedUnhiddenAnalyses: (function() {
    return this.sortUnhiddenAnalyses();
  }).property(),

  sortedAnalyses: Ember.computed.sort('sortedUnhiddenAnalyses', 'analysesSorting'),

  actions: {
    filterVulnerabilityType() {
      this.set("sortedUnhiddenAnalyses", this.get("file.sortedAnalyses"));
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
