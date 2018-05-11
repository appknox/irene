import Ember from 'ember';

export default Ember.Component.extend({
  isGeneralSettings: true,
  isAnalysisSettings: false,

  generalSettingsClass: Ember.computed('isGeneralSettings', function() {
    if (this.get('isGeneralSettings')) {
      return 'is-active';
    }
  }),

  analysisSettingsClass: Ember.computed('isAnalysisSettings', function() {
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
