import Ember from 'ember';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const ProjectPreferencesComponent = Ember.Component.extend({

  project: null,
  selectVersion: 0,
  isSavingPreference: false,
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  selectedDeviceType: ENUMS.DEVICE_TYPE.NO_PREFERENCE,
  deviceTypes: ENUMS.DEVICE_TYPE.CHOICES.slice(1, -1),

  tDeviceSelected: t("deviceSelected"),
  tPleaseTryAgain: t("pleaseTryAgain"),

  devicePreference: (function() {
    return this.get("store").queryRecord('device-preference', {id: this.get("project.activeProfileId")});
  }).property(),

  devices: (function() {
    return this.get("store").findAll("device");
  }).property(),

  availableDevices: Ember.computed.filter('devices', function(device) {
    return device.get("platform") === this.get("project.platform");
  }),

  filteredDevices: Ember.computed("availableDevices", "selectedDeviceType", function() {
    const availableDevices = this.get("availableDevices");
    const selectedDeviceType = this.get("selectedDeviceType");
    return availableDevices.filter(function(device) {
      switch (selectedDeviceType) {
        case ENUMS.DEVICE_TYPE.NO_PREFERENCE:
          return true;
        case ENUMS.DEVICE_TYPE.TABLET_REQUIRED:
          return device.get("isTablet");
        case ENUMS.DEVICE_TYPE.PHONE_REQUIRED:
          return !device.get("isTablet");
      }
    });
  }),

  uniqueDevices: Ember.computed.uniqBy("filteredDevices", 'version'),

  actions: {

    selectDeviceType() {
      this.set("selectedDeviceType", parseInt(this.$('#project-device-preference').val()));
      this.set("selectVersion", 0);
    },

    selectVersion() {
      this.set("selectVersion", this.$('#project-version-preference').val());
    },

    versionSelected() {
      const selectVersion = this.get("selectVersion");
      const tDeviceSelected = this.get("tDeviceSelected");
      const tPleaseTryAgain = this.get("tPleaseTryAgain");
      const selectedDeviceType = this.get("selectedDeviceType");

      const profileId = this.get("project.activeProfileId");
      const devicePreferences = [ENV.endpoints.profiles, profileId, ENV.endpoints.devicePreferences].join('/');
      const that = this;
      const data = {
        device_type: selectedDeviceType,
        platform_version: selectVersion
      };
      this.set("isSavingPreference", true);
      this.get("ajax").put(devicePreferences, {data})
      .then(function() {
        that.get("notify").success(tDeviceSelected);
        if(!that.isDestroyed) {
          that.set("isSavingPreference", false);
          that.set("projectPreferenceModal", false);
          that.set("devicePreference.deviceType", selectedDeviceType);
          that.set("devicePreference.platformVersion", selectVersion);
        }
      })
      .catch(function() {
        if(!that.isDestroyed) {
          that.set("isSavingPreference", false);
          that.get("notify").error(tPleaseTryAgain);
        }
      });
    },

    openProjectPreferenceModal() {
      this.set("projectPreferenceModal", true);
    },

    closeProjectPreferenceModal() {
      this.set("projectPreferenceModal", false);
    }
  }
});


export default ProjectPreferencesComponent;
