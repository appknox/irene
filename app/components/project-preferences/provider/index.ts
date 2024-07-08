// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';

import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type ProjectModel from 'irene/models/project';
import type DevicePreferenceModel from 'irene/models/device-preference';
import type ProjectAvailableDeviceModel from 'irene/models/project-available-device';

import ProfileModel, {
  type ProfileDsAutomatedDeviceSelection,
  type ProfileDsAutomatedDeviceType,
  type ProfileDsManualDeviceSelection,
  type SetProfileDSAutomatedDevicePrefData,
  type SetProfileDSManualDevicePrefData,
  type ProfileDSAutomatedDevicePrefData,
  type ProfileDSManualDevicePrefData,
  type ProfileDynamicScanMode,
  ProfileDsAutomatedDeviceCapabilityPropKeyMap,
} from 'irene/models/profile';

type ProfileDsSelectFuncHandler<T> = (option: { value: T }) => void;

export interface DevicePreferenceContext {
  deviceTypes: DeviceType[];
  selectedDeviceType?: DeviceType;
  selectedVersion: string;
  devicePlatformVersions: string[];
  isPreferredDeviceAvailable: boolean | null;
  projectProfile?: ProfileModel | null;

  dsManualDeviceId?: string;
  dsAutomatedDevicePreference?: ProfileDSAutomatedDevicePrefData;
  dsManualDevicePreference?: ProfileDSManualDevicePrefData;

  handleSelectDeviceType: (deviceType: DeviceType) => void;
  handleSelectVersion: (version: string) => void;
  handleSelectDsManualIdentifier(id: string): void;
  handleSelectDsAutomatedDeviceCapability(event: Event, checked: boolean): void;

  handleDsManualDeviceSelection: ProfileDsSelectFuncHandler<ProfileDsManualDeviceSelection>;
  handleDsAutomatedDeviceSelection: ProfileDsSelectFuncHandler<ProfileDsAutomatedDeviceSelection>;
  handleSelectDsAutomatedDeviceType: ProfileDsSelectFuncHandler<ProfileDsAutomatedDeviceType>;
}

export interface ProjectPreferencesProviderSignature {
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

export default class ProjectPreferencesProviderComponent extends Component<ProjectPreferencesProviderSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked selectedVersion = '0';

  @tracked selectedDeviceType?: DeviceType;
  @tracked deviceTypes = ENUMS.DEVICE_TYPE.CHOICES;
  @tracked devicePreference?: DevicePreferenceModel;

  @tracked projectProfile?: ProfileModel | null = null;
  @tracked dsManualDeviceId: string | undefined;

  @tracked dsManualDevicePreference?: ProfileDSManualDevicePrefData;
  @tracked dsManualDeviceSelection?: ProfileDsManualDeviceSelection;

  @tracked dsAutomatedDevicePreference?: ProfileDSAutomatedDevicePrefData;
  @tracked dsAutomatedDeviceSelection?: ProfileDsAutomatedDeviceSelection;

  @tracked
  devices: DS.AdapterPopulatedRecordArray<ProjectAvailableDeviceModel> | null =
    null;

  constructor(
    owner: unknown,
    args: ProjectPreferencesProviderSignature['Args']
  ) {
    super(owner, args);

    this.fetchProjectProfile.perform();

    // TODO: To be removed when new DAST APIs go live
    this.fetchDevicePreference.perform();
    this.fetchDevices.perform();
  }

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

  get defaultProfileDSAutomatedData() {
    return {
      ds_automated_device_type: this.projectProfile?.dsAutomatedDeviceType,
      ds_automated_vpn_required: this.projectProfile?.dsAutomatedVpnRequired,
      ds_automated_sim_required: this.projectProfile?.dsAutomatedSimRequired,

      ds_automated_device_identifier:
        this.projectProfile?.dsAutomatedDeviceIdentifier,

      ds_automated_platform_version_min:
        this.projectProfile?.dsAutomatedPlatformVersionMin,

      ds_automated_platform_version_max:
        this.projectProfile?.dsAutomatedPlatformVersionMax,

      ds_automated_pin_lock_required:
        this.projectProfile?.dsAutomatedPinLockRequired,

      ds_automated_use_reserved_device:
        this.projectProfile?.dsAutomatedUseReservedDevice,

      ds_automated_device_selection:
        this.projectProfile?.dsAutomatedDeviceSelection,
    };
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

  @action
  handleSelectDsManualIdentifier(id: string) {
    this.dsManualDeviceId = id;

    this.updateDsManualDevicePreference.perform({
      ds_manual_device_identifier: id,
      ds_manual_device_selection: this.projectProfile?.dsManualDeviceSelection,
    });
  }

  @action
  handleDsManualDeviceSelection(opt: {
    value: ProfileDsManualDeviceSelection;
  }) {
    this.projectProfile?.set('dsManualDeviceSelection', opt.value);

    this.updateDsManualDevicePreference.perform({
      ds_manual_device_selection: opt.value,
      ds_manual_device_identifier:
        this.projectProfile?.dsManualDeviceIdentifier,
    });
  }

  @action
  handleSelectDsAutomatedDeviceCapability(event: Event, checked: boolean) {
    const dctKey = (event.target as HTMLElement)
      .id as keyof typeof ProfileDsAutomatedDeviceCapabilityPropKeyMap;

    this.projectProfile?.set(dctKey, checked);

    this.updateDsAutomatedDevicePreference.perform({
      ...this.defaultProfileDSAutomatedData,
      [ProfileDsAutomatedDeviceCapabilityPropKeyMap[dctKey]]: checked,
    });
  }

  @action
  handleDsAutomatedDeviceSelection(option: {
    value: ProfileDsAutomatedDeviceSelection;
  }) {
    this.projectProfile?.set('dsAutomatedDeviceSelection', option.value);

    this.updateDsAutomatedDevicePreference.perform({
      ...this.defaultProfileDSAutomatedData,
      ds_automated_device_selection: option.value,
      ds_automated_device_type: this.projectProfile?.dsAutomatedDeviceType,
    });
  }

  @action
  handleSelectDsAutomatedDeviceType(option: {
    value: ProfileDsAutomatedDeviceType;
  }) {
    const isAnyDeviceSelection =
      option.value === ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE;

    const deviceType =
      isAnyDeviceSelection || !this.projectProfile?.dsAutomatedDeviceType
        ? ENUMS.DS_AUTOMATED_DEVICE_TYPE.NO_PREFERENCE
        : this.projectProfile?.dsAutomatedDeviceType;

    this.updateDsAutomatedDevicePreference.perform({
      ...this.defaultProfileDSAutomatedData,
      ds_automated_device_type: deviceType,
      ds_automated_device_selection:
        this.projectProfile?.dsAutomatedDeviceSelection,
    });
  }

  @action
  startDynamicScan(mode: ProfileDynamicScanMode, enableApiCapture?: boolean) {
    this.triggerDynamicScanStart.perform(mode, enableApiCapture);
  }

  triggerDynamicScanStart = task(
    async (mode: ProfileDynamicScanMode, enableApiCapture?: boolean) => {
      try {
        const profileId = this.args.profileId;

        const devicePreferences = [
          ENV.endpoints['profiles'],
          profileId,
          ENV.endpoints['devicePreferences'],
        ].join('/');

        const data = {
          mode,
          enable_api_capture: enableApiCapture,
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
    }
  );

  fetchProjectProfile = task(async () => {
    try {
      const profile = await this.store.findRecord(
        'profile',
        Number(this.args.profileId)
      );

      this.projectProfile = profile;

      await this.fetchDsManualDevicePref.perform();
      await this.fetchDsAutomatedDevicePref.perform();
    } catch (error) {
      this.notify.error(this.intl.t('errorFetchingDevicePreferences'));
    }
  });

  fetchDsManualDevicePref = task(async () => {
    try {
      const dsManualDevicePreference =
        await this.projectProfile?.getDSManualDevicePrefData();

      this.dsManualDevicePreference = dsManualDevicePreference;

      this.dsManualDeviceId =
        dsManualDevicePreference?.ds_manual_device_identifier;

      this.dsManualDeviceSelection =
        dsManualDevicePreference?.ds_manual_device_selection;
    } catch (error) {
      this.notify.error(this.intl.t('errorFetchingDsManualDevicePref'));
    }
  });

  updateDsManualDevicePreference = task(
    async (data: SetProfileDSManualDevicePrefData) => {
      try {
        const dsManualDevicePreference =
          await this.projectProfile?.setDSManualDevicePrefData(data);

        this.dsManualDevicePreference = dsManualDevicePreference;
      } catch (error) {
        this.notify.error(this.intl.t('errorFetchingDsManualDevicePref'));
      }
    }
  );

  updateDsAutomatedDevicePreference = task(
    async (data: SetProfileDSAutomatedDevicePrefData) => {
      try {
        const dsAutomatedDevicePreference =
          await this.projectProfile?.setDSAutomatedPrefData(data);

        this.dsAutomatedDevicePreference = dsAutomatedDevicePreference;
      } catch (error) {
        this.notify.error(this.intl.t('errorFetchingDsManualDevicePref'));
      }
    }
  );

  fetchDsAutomatedDevicePref = task(async () => {
    try {
      const dsAutomatedDevicePref =
        await this.projectProfile?.getDSAutomatedPrefData();

      this.dsAutomatedDevicePreference = dsAutomatedDevicePref;

      this.dsAutomatedDeviceSelection =
        dsAutomatedDevicePref?.ds_automated_device_selection;
    } catch (error) {
      this.notify.error(this.intl.t('errorFetchingDsAutomatedDevicePref'));
    }
  });

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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectPreferences::Provider': typeof ProjectPreferencesProviderComponent;
  }
}
