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
import FileModel from 'irene/models/file';
import type IreneAjaxService from 'irene/services/ajax';

export interface DevicePreferenceContext {
  filteredDevices?: ProjectAvailableDeviceModel[];
  deviceTypes: DeviceType[];
  selectedDeviceType?: DeviceType;
  handleSelectDeviceType: (deviceType: DeviceType) => void;
  selectedVersion: string;
  devicePlatformVersions: string[];
  handleSelectVersion: (version: string) => void;
  isPreferredDeviceAvailable: boolean | null;

  updateDevicePref(
    device_type: string | number | undefined,
    platform_version: string,
    silentNotifications?: boolean
  ): void;

  compareVersions(v1: string, v2: string): number;
}

export interface ProjectPreferencesOldProviderSignature {
  Args: {
    file?: FileModel | null;
    project?: ProjectModel | null;
    profileId?: number | string;
  };
  Blocks: {
    default: [DevicePreferenceContext];
  };
}

type EnumObject = { key: string; value: number | string };
type DeviceType = EnumObject;

export default class ProjectPreferencesOldProviderComponent extends Component<ProjectPreferencesOldProviderSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
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

      this.selectedDeviceType = this.deviceTypes.find(
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
    const supportedTypes =
      this.args.file?.supportedDeviceTypes ||
      this.args.project?.get('lastFile')?.get('supportedDeviceTypes');

    const platform = this.args.project?.get('platform');

    return this.deviceTypes.filter((type) => {
      switch (type.value) {
        // Always filter out unknown device type
        case ENUMS.DEVICE_TYPE.UNKNOWN:
          return false;

        // Always show "Any Device" option
        case ENUMS.DEVICE_TYPE.NO_PREFERENCE:
          return true;

        // For iOS, show tablet option only if iPad is supported
        case ENUMS.DEVICE_TYPE.TABLET_REQUIRED:
          return supportedTypes?.includes('iPad');

        case ENUMS.DEVICE_TYPE.PHONE_REQUIRED:
          // For Android, only show phone options
          if (ENUMS.PLATFORM.ANDROID === platform) {
            return true;
          }

          // For iOS, show phone option only if iPhone is supported
          return supportedTypes?.includes('iPhone');

        default:
          return true;
      }
    });
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
    const devices = this.filteredDevices?.uniqBy('platformVersion');

    const minOsVersion =
      this.args.file?.minOsVersion ||
      this.args.project?.get('lastFile')?.get('minOsVersion');

    // Sort the unique devices versions in descending order
    const sortedDevices = devices?.sort((a, b) =>
      this.compareVersions(b.platformVersion, a.platformVersion)
    );

    if (!minOsVersion && sortedDevices) {
      return [...sortedDevices];
    }

    return sortedDevices?.filter((d) => {
      return (
        this.compareVersions(d.platformVersion, minOsVersion as string) >= 0
      );
    });
  }

  get devicePlatformVersionOptions() {
    return ['0', ...(this.uniqueDevices?.map((d) => d.platformVersion) || [])];
  }

  get isPreferredDeviceAvailable() {
    // check whether preferences & devices are resolved
    if (this.devicePreference && this.uniqueDevices) {
      const deviceType = Number(this.devicePreference.deviceType);
      const version = this.devicePreference.platformVersion;

      // if all devices are allocated
      if (this.uniqueDevices.length === 0) {
        return false;
      }

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
  parseVersion(version: string): number[] {
    // Extract version numbers (e.g., "15.8.3 support" -> [15,8,3])
    const match = version.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);

    if (!match) {
      return [0];
    }

    // Convert matched groups to numbers, defaulting to 0 if not present
    return [
      parseInt(match[1] || '0', 10),
      parseInt(match[2] || '0', 10),
      parseInt(match[3] || '0', 10),
    ];
  }

  @action
  compareVersions(v1: string, v2: string): number {
    const v1Parts = this.parseVersion(v1);
    const v2Parts = this.parseVersion(v2);

    // Compare each part of the version
    for (let i = 0; i < 3; i++) {
      const v1Part = v1Parts[i] as number;
      const v2Part = v2Parts[i] as number;

      if (v1Part > v2Part) {
        return 1;
      }

      if (v1Part < v2Part) {
        return -1;
      }
    }

    return 0;
  }

  @action
  updateDevicePref(
    device_type: string | number | undefined,
    platform_version: string,
    silentNotifications?: boolean
  ) {
    this.versionSelected.perform(
      device_type,
      platform_version,
      silentNotifications
    );
  }

  @action
  handleSelectDeviceType(deviceType: DeviceType) {
    this.selectedDeviceType = deviceType;
    this.selectedVersion = '0';

    this.updateDevicePref(this.selectedDeviceType?.value, this.selectedVersion);
  }

  @action
  handleSelectVersion(version: string) {
    this.selectedVersion = version;

    this.updateDevicePref(this.selectedDeviceType?.value, this.selectedVersion);
  }

  versionSelected = task(
    async (
      device_type: string | number | undefined,
      platform_version: string,
      silentNotifications = false
    ) => {
      try {
        const profileId = this.args.profileId;

        const devicePreferences = [
          ENV.endpoints['profiles'],
          profileId,
          ENV.endpoints['devicePreferences'],
        ].join('/');

        const data = {
          device_type,
          platform_version,
        };

        await this.ajax.put(devicePreferences, { data });

        if (!this.isDestroyed && this.devicePreference) {
          this.devicePreference.deviceType = this.selectedDeviceType
            ?.value as number;

          this.devicePreference.platformVersion = this.selectedVersion;

          if (!silentNotifications) {
            this.notify.success(this.intl.t('savedPreferences'));
          }
        }
      } catch (e) {
        if (!silentNotifications) {
          this.notify.error(this.intl.t('somethingWentWrong'));
        }
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectPreferencesOld::Provider': typeof ProjectPreferencesOldProviderComponent;
  }
}
