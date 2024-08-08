// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

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
  type SetProfileDSAutomatedDevicePrefData,
  type SetProfileDSManualDevicePrefData,
  type ProfileDSAutomatedDevicePrefData,
  type ProfileDSManualDevicePrefData,
} from 'irene/models/profile';

type ProfileDsSelectFuncHandler = (option: { value: number }) => void;

export interface DevicePreferenceContext {
  deviceTypes: DeviceType[];
  selectedDeviceType?: DeviceType;
  selectedVersion: string;
  devicePlatformVersions: string[];
  isPreferredDeviceAvailable: boolean | null;
  projectProfile?: ProfileModel | null;

  dsAutomatedDevicePreference?: Partial<ProfileDSAutomatedDevicePrefData>;
  dsManualDevicePreference?: Partial<ProfileDSManualDevicePrefData>;

  handleSelectDeviceType: (deviceType: DeviceType) => void;
  handleSelectVersion: (version: string) => void;
  handleDsAutomatedMinOSVersionSelect: (version: string) => void;
  handleSelectDsManualIdentifier(id: string): void;
  handleSelectDsAutomatedDeviceCapability(event: Event, checked: boolean): void;

  handleDsManualDeviceSelection: ProfileDsSelectFuncHandler;
  handleDsAutomatedDeviceSelection: ProfileDsSelectFuncHandler;
  handleSelectDsAutomatedDeviceType: ProfileDsSelectFuncHandler;

  loadingDsAutoDevicePref: boolean;
  loadingDsManualDevicePref: boolean;
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
  @tracked dsManualDevicePreference?: Partial<ProfileDSManualDevicePrefData>;

  @tracked
  dsManualDevicePreferenceCopy?: Partial<ProfileDSManualDevicePrefData>;

  @tracked
  dsAutomatedDevicePreference?: Partial<ProfileDSAutomatedDevicePrefData>;

  @tracked
  dsAutomatedDevicePreferenceCopy?: Partial<ProfileDSAutomatedDevicePrefData>;

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
    const updatedPref = {
      ...this.dsManualDevicePreference,
      ds_manual_device_identifier: id,
    };

    this.dsManualDevicePreference = updatedPref;

    this.updateDsManualDevicePreference.perform(updatedPref);
  }

  @action
  handleDsManualDeviceSelection(opt: { value: number }) {
    const updatedDsManualDevicePreference = {
      ...this.dsManualDevicePreference,
      ds_manual_device_selection: opt.value,
    };

    this.dsManualDevicePreference = updatedDsManualDevicePreference;

    if (opt.value === ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE) {
      this.updateDsManualDevicePreference.perform({
        ...updatedDsManualDevicePreference,
        ds_manual_device_identifier: '',
      });
    }
  }

  @action
  handleDsAutomatedMinOSVersionSelect(opt: string) {
    const updatedPref = {
      ...this.dsAutomatedDevicePreference,
      ds_automated_platform_version_min: opt,
    };

    this.dsAutomatedDevicePreference = updatedPref;

    this.updateDsAutomatedDevicePreference.perform(updatedPref);
  }

  @action
  handleSelectDsAutomatedDeviceCapability(event: Event, checked: boolean) {
    const dctKey = (event.target as HTMLElement).id as keyof Pick<
      ProfileDSAutomatedDevicePrefData,
      | 'ds_automated_vpn_required'
      | 'ds_automated_sim_required'
      | 'ds_automated_pin_lock_required'
    >;

    const updatedDsAutomatedDevicePreference = {
      ...this.dsAutomatedDevicePreference,
      [dctKey]: checked,
    };

    this.updateDsAutomatedDevicePreference.perform(
      updatedDsAutomatedDevicePreference
    );
  }

  @action
  handleDsAutomatedDeviceSelection(option: { value: number }) {
    const updatedPref = {
      ...this.dsAutomatedDevicePreference,
      ds_automated_device_selection: option.value,
    };

    this.dsAutomatedDevicePreference = updatedPref;

    this.updateDsAutomatedDevicePreference.perform(updatedPref);
  }

  @action
  handleSelectDsAutomatedDeviceType(option: { value: number }) {
    const isAnyDeviceSelection =
      option.value === ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE;

    const autoDastDeviceType =
      this.dsAutomatedDevicePreference?.ds_automated_device_type;

    const deviceType =
      isAnyDeviceSelection || !autoDastDeviceType
        ? ENUMS.DS_AUTOMATED_DEVICE_TYPE.NO_PREFERENCE
        : autoDastDeviceType;

    this.updateDsAutomatedDevicePreference.perform({
      ...this.dsAutomatedDevicePreference,
      ds_automated_device_type: deviceType,
    });
  }

  fetchProjectProfile = task(async () => {
    try {
      const profile = await this.store.findRecord(
        'profile',
        Number(this.args.profileId)
      );

      this.projectProfile = profile;

      this.fetchDsManualDevicePref.perform();
      this.fetchDsAutomatedDevicePref.perform();
    } catch (error) {
      this.notify.error(this.intl.t('errorFetchingDevicePreferences'));
    }
  });

  fetchDsManualDevicePref = task(async () => {
    try {
      const dsManualDevicePreference =
        await this.projectProfile?.getDsManualDevicePreference();

      this.dsManualDevicePreference = dsManualDevicePreference;
      this.dsManualDevicePreferenceCopy = dsManualDevicePreference;
    } catch (error) {
      this.notify.error(this.intl.t('failedToUpdateDsManualDevicePref'));
    }
  });

  updateDsManualDevicePreference = task(
    async (data: SetProfileDSManualDevicePrefData) => {
      try {
        const dsManualDevicePreference =
          await this.projectProfile?.setDSManualDevicePrefData(data);

        this.dsManualDevicePreference = dsManualDevicePreference;
        this.dsManualDevicePreferenceCopy = dsManualDevicePreference;

        this.notify.success(this.intl.t('savedPreferences'));
      } catch (error) {
        this.dsManualDevicePreference = this.dsManualDevicePreferenceCopy;

        this.notify.error(this.intl.t('errorFetchingDsManualDevicePref'));
      }
    }
  );

  updateDsAutomatedDevicePreference = task(
    async (data: SetProfileDSAutomatedDevicePrefData) => {
      try {
        const dsAutomatedDevicePreference =
          await this.projectProfile?.setDSAutomatedDevicePrefData(data);

        this.dsAutomatedDevicePreference = dsAutomatedDevicePreference;
        this.dsAutomatedDevicePreferenceCopy = dsAutomatedDevicePreference;

        this.notify.success(this.intl.t('savedPreferences'));
      } catch (error) {
        this.dsAutomatedDevicePreference = this.dsAutomatedDevicePreferenceCopy;

        this.notify.error(this.intl.t('failedToUpdateDsAutomatedDevicePref'));
      }
    }
  );

  fetchDsAutomatedDevicePref = task(async () => {
    try {
      const dsAutomatedDevicePref =
        await this.projectProfile?.getDsAutomatedDevicePreference();

      this.dsAutomatedDevicePreference = dsAutomatedDevicePref;
      this.dsManualDevicePreferenceCopy = dsAutomatedDevicePref;
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
