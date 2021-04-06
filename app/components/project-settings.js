import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  isGeneralSettings: true,
  isAnalysisSettings: false,
  me: service('me'),
  organization: service(),

  profile: computed('project.activeProfileId', 'store', function() {
    var profileId = this.get('project.activeProfileId');
    return this.get('store').findRecord('profile', profileId);
  }),

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
