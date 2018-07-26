import Ember from 'ember';

const SecuritySplitComponent = Ember.Component.extend({

  isSearchClass: false,
  isDownloadAppClass: false,
  isPurgeAnalysisClass: false,

  didInsertElement() {
    this.activeTab();
  },

  activeTab() {
    const path = window.location.pathname;
    switch (path) {
      case "/security/project-list": return this.set("isSearchClass", true);
      case "/security/downloadapp": return this.set("isDownloadAppClass", true);
      case "/security/purgeanalysis": return this.set("isPurgeAnalysisClass", true);
    }
  },

  searchClass: Ember.computed("isSearchClass", function() {
    if (this.get('isSearchClass')) {
      return 'is-active';
    }
  }),

  downloadAppClass: Ember.computed("isDownloadAppClass", function() {
    if (this.get('isDownloadAppClass')) {
      return 'is-active';
    }
  }),

  purgeAnalysisClass: Ember.computed("isPurgeAnalysisClass", function() {
    if (this.get('isPurgeAnalysisClass')) {
      return 'is-active';
    }
  }),

  actions: {

    displaySearch() {
      this.set("isGenerateReportClass", false);
      this.set("isDownloadAppClass", false);
      this.set("isDowloadReportClass", false);
      this.set("isSearchClass", true);
      return this.set("isPurgeAnalysisClass", false);
    },

    displayDownloadApp() {
      this.set("isGenerateReportClass", false);
      this.set("isDownloadAppClass", true);
      this.set("isDowloadReportClass", false);
      this.set("isSearchClass", false);
      return this.set("isPurgeAnalysisClass", false);
    },

    displayPurgeAnalysis() {
      this.set("isGenerateReportClass", false);
      this.set("isDownloadAppClass", false);
      this.set("isDowloadReportClass", false);
      this.set("isSearchClass", false);
      return this.set("isPurgeAnalysisClass", true);
    }
  }
});




export default SecuritySplitComponent;
