import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Store from '@ember-data/store';
import { task } from 'ember-concurrency';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import ProjectModel from 'irene/models/project';
import DevicePreferenceModel from 'irene/models/device-preference';
import ProjectAvailableDeviceModel from 'irene/models/project-available-device';

export interface DevicePreferenceContext {
  deviceTypes: DeviceType[];
  selectedDeviceType?: DeviceType;
  handleSelectDeviceType: (deviceType: DeviceType) => void;
  selectedVersion: string;
  devicePlatformVersions: string[];
  handleSelectVersion: (version: string) => void;
  isPreferredDeviceAvailable: boolean | null;
}

export interface ProjectPreferencesOldProviderSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: number | string;
    platform?: number;
  };
  Blocks: {
    default: [DevicePreferenceContext];
  };
}

type EnumObject = { key: string; value: number | string };
type DeviceType = EnumObject;

export default class ProjectPreferencesOldProviderComponent extends Component<ProjectPreferencesOldProviderSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked selectedVersion = '0';

  @tracked selectedDeviceType?: DeviceType;

  @tracked deviceTypes = ENUMS.DEVICE_TYPE.CHOICES;
  @tracked devicePreference?: DevicePreferenceModel;

  @tracked
  devices: DS.AdapterPopulatedRecordArray<ProjectAvailableDeviceModel> | null =
    null;

  constructor(
    owner: unknown,
    args: ProjectPreferencesOldProviderSignature['Args']
  ) {
    super(owner, args);

    this.fetchDevicePreference.perform();
    this.fetchDevices.perform();
  }

  fetchDevicePreference = task(async () => {
    try {
      this.devicePreference = await this.store.queryRecord(
        'device-preference',
        {
          id: this.args.profileId,
        }
      );

      this.selectedDeviceType = this.filteredDeviceTypes.find(
        (it) => it.value === this.devicePreference?.deviceType
      );

      this.selectedVersion = this.devicePreference.platformVersion;
    } catch (error) {
      this.notify.error(this.intl.t('errorFetchingDevicePreferences'));
    }
  });

  fetchDevices = task(async () => {
    try {
      this.devices = await this.store.query('project-available-device', {
        projectId: this.args.project?.get('id'),
      });
    } catch (error) {
      this.notify.error(this.intl.t('errorFetchingDevices'));
    }
  });

  get tAnyVersion() {
    return this.intl.t('anyVersion');
  }

  get filteredDeviceTypes() {
    return this.deviceTypes.filter(
      (type) => ENUMS.DEVICE_TYPE.UNKNOWN !== type.value
    );
  }

  get availableDevices() {
    return this.devices?.filter(
      (d) => d.platform === this.args.project?.get('platform')
    );
  }

  get filteredDevices() {
    return this.availableDevices?.filter((device) => {
      switch (this.selectedDeviceType?.value) {
        case ENUMS.DEVICE_TYPE.NO_PREFERENCE:
          return true;

        case ENUMS.DEVICE_TYPE.TABLET_REQUIRED:
          return device.isTablet;

        case ENUMS.DEVICE_TYPE.PHONE_REQUIRED:
          return !device.isTablet;

        default:
          return true;
      }
    });
  }

  get uniqueDevices() {
    return this.filteredDevices?.uniqBy('platformVersion');
  }

  get devicePlatformVersionOptions() {
    return ['0', ...(this.uniqueDevices?.map((d) => d.platformVersion) || [])];
  }

  get isPreferredDeviceAvailable() {
    // check whether preferences & devices are resolved
    if (this.devicePreference && this.uniqueDevices) {
      const deviceType = Number(this.devicePreference.deviceType);
      const version = this.devicePreference.platformVersion;

      // if both device type and os is any then return true
      if (deviceType === 0 && version === '0') {
        return true;
      }

      // if os is any then return true
      if (version === '0') {
        return true;
      }

      // check if preferred device type & os exists
      return this.uniqueDevices.some((d) => {
        // if only device type is any then just check version
        if (deviceType === 0) {
          return d.platformVersion === version;
        }

        return (
          d.platformVersion === version &&
          (d.isTablet
            ? deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED
            : deviceType === ENUMS.DEVICE_TYPE.PHONE_REQUIRED)
        );
      });
    }

    return null;
  }

  @action
  handleSelectDeviceType(deviceType: DeviceType) {
    this.selectedDeviceType = deviceType;
    this.selectedVersion = '0';

    this.versionSelected.perform();
  }

  @action
  handleSelectVersion(version: string) {
    this.selectedVersion = version;

    this.versionSelected.perform();
  }

  versionSelected = task(async () => {
    try {
      const profileId = this.args.profileId;

      const devicePreferences = [
        ENV.endpoints['profiles'],
        profileId,
        ENV.endpoints['devicePreferences'],
      ].join('/');

      const data = {
        device_type: this.selectedDeviceType?.value,
        platform_version: this.selectedVersion,
      };

      await this.ajax.put(devicePreferences, { data });

      if (!this.isDestroyed && this.devicePreference) {
        this.devicePreference.deviceType = this.selectedDeviceType
          ?.value as number;

        this.devicePreference.platformVersion = this.selectedVersion;

        this.notify.success(this.intl.t('savedPreferences'));
      }
    } catch (e) {
      this.notify.error(this.intl.t('somethingWentWrong'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectPreferencesOld::Provider': typeof ProjectPreferencesOldProviderComponent;
  }
}
