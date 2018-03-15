import Ember from 'ember';

const SettingsSplitComponent = Ember.Component.extend({

  isGeneral: true,
  isSecurity: false,
  isDeveloperSettings: false,

  generalClass: Ember.computed('isGeneral', function() {
    if (this.get('isGeneral')) {
      return 'is-active';
    }
  }),

  securityClass: Ember.computed('isSecurity', function() {
    if (this.get('isSecurity')) {
      return 'is-active';
    }
  }),


  developerSettingsClass: Ember.computed('isDeveloperSettings', function() {
    if (this.get('isDeveloperSettings')) {
      return 'is-active';
    }
  }),

  actions: {
    displayGeneral() {
      this.set('isGeneral', true);
      this.set('isSecurity', false);
      this.set('isDeveloperSettings', false);
    },

    displaySecurity() {
      this.set('isGeneral', false);
      this.set('isSecurity', true);
      this.set('isDeveloperSettings', false);
    },

    displayDeveloperSettings() {
      this.set('isGeneral', false);
      this.set('isSecurity', false);
      this.set('isDeveloperSettings', true);
    }
  }
});

export default SettingsSplitComponent;
