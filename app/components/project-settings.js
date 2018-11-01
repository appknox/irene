import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  isGeneralSettings: true,
  isAnalysisSettings: false,

  generalSettingsClass: computed('isGeneralSettings', function() {
    if (this.get('isGeneralSettings')) {
      return 'is-active';
    }
  }),

  analysisSettingsClass: computed('isAnalysisSettings', function() {
    if (this.get('isAnalysisSettings')) {
      return 'is-active';
    }
  }),

  actions: {
    displayGeneralSettings() {
      this.set('isGeneralSettings', true);
      this.set('isAnalysisSettings', false);
    },

    displaAnalysisSettings() {
      this.set('isGeneralSettings', false);
      this.set('isAnalysisSettings', true);
    }
  }
});
