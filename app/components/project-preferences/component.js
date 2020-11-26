import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';

const ProjectPreferencesComponent = Component.extend({

  project: null,
  selectVersion: "0",
  intl: service(),
  ajax: service(),
  notify: service('notifications'),
  deviceTypes: ENUMS.DEVICE_TYPE.CHOICES,

  tAnyVersion: t("anyVersion"),

  devicePreference: computed('profileId', 'store', function() {
    return this.get("store").queryRecord('device-preference', {id: this.get("profileId")});
  }),

  devices: computed('project.id', 'store', function() {
    return this.get("store").query('project-available-device', {projectId: this.get("project.id")});
  }),

  selectedDeviceType: computed.reads('devicePreference.deviceType'),

  filteredDeviceTypes: computed("deviceTypes", "devicePreference.deviceType", function() {
    const deviceTypes = this.get("deviceTypes");
    const deviceType = this.get("devicePreference.deviceType");
    const unknown = ENUMS.DEVICE_TYPE.UNKNOWN;
    const allDeviceTypes = deviceTypes.filter(type => unknown !== type.value);
    return allDeviceTypes.filter(type => deviceType !== type.value);
  }),

  availableDevices: computed.filter('devices', function(device) {
    return device.get("platform") === this.get("project.platform");
  }),

  filteredDevices: computed("availableDevices", "selectedDeviceType", function() {
    const availableDevices = this.get("availableDevices");
    const selectedDeviceType = this.get("selectedDeviceType");
    return availableDevices.filter((device) => {
      switch (selectedDeviceType) {
        case ENUMS.DEVICE_TYPE.NO_PREFERENCE:
          return true;
        case ENUMS.DEVICE_TYPE.TABLET_REQUIRED:
          return device.get("isTablet");
        case ENUMS.DEVICE_TYPE.PHONE_REQUIRED:
          return !device.get("isTablet");
        default:
          return true;
      }
    });
  }),

  uniqueDevices: computed.uniqBy("filteredDevices", 'platformVersion'),

  filteredUniqueDevices: computed("uniqueDevices", "devicePreference.platformVersion", function() {
    const uniqueDevices = this.get("uniqueDevices");
    const platformVersion = this.get("devicePreference.platformVersion");
    return uniqueDevices.filter(device => platformVersion !== device.get("platformVersion"));
  }),

  actions: {

    selectDeviceType() {
      this.set("selectedDeviceType", parseInt(this.$('#project-device-preference').val()));
      this.set("selectVersion", "0");
      this.send("versionSelected");
    },

    selectVersion() {
      this.set("selectVersion", this.$('#project-version-preference').val());
      this.send("versionSelected");
    },

    versionSelected() {
      const selectVersion = this.get("selectVersion");
      const selectedDeviceType = this.get("selectedDeviceType");

      const profileId = this.get("profileId");
      const devicePreferences = [ENV.endpoints.profiles, profileId, ENV.endpoints.devicePreferences].join('/');
      const data = {
        device_type: selectedDeviceType,
        platform_version: selectVersion
      };
      this.set("showStatus", true);
      this.set("isSavingPreference", true);
      this.get("ajax").put(devicePreferences, {data})
      .then(() => {
        if(!this.isDestroyed) {
          this.set("isSavingPreference", false);
          this.set("isNotSuccessful", false);
          this.set("isSuccessful", true);
          setTimeout(() => {
            this.set("isSuccessful", false);
          }, 2000);
          this.set("devicePreference.deviceType", selectedDeviceType);
          this.set("devicePreference.platformVersion", selectVersion);
        }
      }, () => {
        if(!this.isDestroyed) {
          this.set("isSavingPreference", false);
          this.set("isNotSuccessful", true);
          this.set("devicePreference.deviceType", this.get("devicePreference.deviceType"));
          this.set("devicePreference.platformVersion", this.get("devicePreference.platformVersion"));
        }
      });
    }
  }
});


export default ProjectPreferencesComponent;
