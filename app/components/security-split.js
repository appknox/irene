/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-component-lifecycle-hooks, ember/require-return-from-computed, ember/no-get, ember/no-actions-hash */
import Component from '@ember/component';
import { computed } from '@ember/object';

const SecuritySplitComponent = Component.extend({

  isSearchClass: false,
  isDownloadAppClass: false,
  isPurgeAnalysisClass: false,

  didInsertElement() {
this._super(...arguments);
    this.activeTab();
  },

  activeTab() {
    const path = window.location.pathname;
    switch (path) {
      case "/security/projects": return this.set("isSearchClass", true);
      case "/security/downloadapp": return this.set("isDownloadAppClass", true);
      case "/security/purgeanalysis": return this.set("isPurgeAnalysisClass", true);
    }
  },

  searchClass: computed("isSearchClass", function() {
    if (this.get('isSearchClass')) {
      return 'is-active';
    }
  }),

  downloadAppClass: computed("isDownloadAppClass", function() {
    if (this.get('isDownloadAppClass')) {
      return 'is-active';
    }
  }),

  purgeAnalysisClass: computed("isPurgeAnalysisClass", function() {
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
