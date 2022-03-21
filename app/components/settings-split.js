/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/require-return-from-computed, ember/no-get, ember/no-component-lifecycle-hooks, ember/no-actions-hash */
import Component from '@ember/component';
import { computed } from '@ember/object';

const SettingsSplitComponent = Component.extend({

  isGeneral: true,
  isSecurity: false,
  isDeveloperSettings: false,

  generalClass: computed('isGeneral', function() {
    if (this.get('isGeneral')) {
      return 'is-active';
    }
  }),

  securityClass: computed('isSecurity', function() {
    if (this.get('isSecurity')) {
      return 'is-active';
    }
  }),

  developerSettingsClass: computed('isDeveloperSettings', function() {
    if (this.get('isDeveloperSettings')) {
      return 'is-active';
    }
  }),

  didInsertElement() {
this._super(...arguments);
    const path = window.location.pathname;
    if(path === "/settings/security") {
      this.set("isGeneral", false);
      this.set("isSecurity", true);
      this.set("isDeveloperSettings", false);
    }
    else if(path === "/settings/developersettings") {
      this.set("isGeneral", false);
      this.set("isSecurity", false);
      this.set("isDeveloperSettings", true);
    }
  },

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
