import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import ENUMS from 'irene/enums';
import $ from 'jquery';

const FileDetailsComponent = Component.extend({
  ajax: service(),
  routing: service('-routing'),
  scrollTo: service('scroll-to'),
  sortImpactAscending: false,
  // currentAnalysis: null,

  isSecurityEnabled: false,

  vulnerabilityType: ENUMS.VULNERABILITY_TYPE.UNKNOWN,
  vulnerabilityTypes: ENUMS.VULNERABILITY_TYPE.CHOICES.slice(0, -1),
  isAnalysisDetails: true,
  isDynamicScanDetails: false,
  analyses: computed("file.sortedAnalyses", function() {
    return this.get("file.sortedAnalyses");
  }),

  analysesObserver: observer('analyses.@each', function() {
    this.updateUnhiddenAnalysis();
  }),

  didInsertElement() {
    this.securityEnabled();
    const route = this.get('routing.currentRouteName');
    const routeName = route.split(".")[2];

    if(routeName === "dynamicscans") {
      this.set('isDynamicScanDetails', true);
      this.set('isAnalysisDetails', false);
    }
    if(routeName === "index"){
      this.set('isDynamicScanDetails', false);
    }
    // }else{

    // }
  },

  securityEnabled() {
    this.get("ajax").request("projects", {namespace: 'api/hudson-api'})
    .then(() => {
      if(!this.isDestroyed) {
        this.set("isSecurityEnabled", true);
      }
    }, () => {
      if(!this.isDestroyed) {
        this.set("isSecurityEnabled", false);
      }
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

  sortedUnhiddenAnalyses: computed(function() {
    return this.sortUnhiddenAnalyses();
  }),

  sortedAnalyses: computed.sort('sortedUnhiddenAnalyses', 'analysesSorting'),

  analysisDetailsClass: computed('isAnalysisDetails', function() {
    if (this.get('isAnalysisDetails')) {

      return 'is-active';
    }
  }),
  dynamicScanDetailsClass: computed('isDynamicScanDetails', function() {
    if (this.get('isDynamicScanDetails')) {
      return 'is-active';
    }
  }),

  actions: {
    filterVulnerabilityType() {
      this.set("sortedUnhiddenAnalyses", this.get("file.sortedAnalyses"));
      this.set("sortImpactAscending", false);
      // eslint-disable-next-line no-undef
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
    },
    displayAnalysisDetails() {
      this.set('isAnalysisDetails', true);
      this.set('isDynamicScanDetails', false);
    },

    displayDynamicScanDetails() {
      this.set('isDynamicScanDetails', true);
      this.set('isAnalysisDetails', false);
    },
  }
});

export default FileDetailsComponent;
