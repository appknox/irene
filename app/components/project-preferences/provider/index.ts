import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

import ENUMS from 'irene/enums';

import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type ProjectModel from 'irene/models/project';

import ProfileModel, {
  type SetProfileDSAutomatedDevicePrefData,
  type SetProfileDSManualDevicePrefData,
  type ProfileDSAutomatedDevicePrefData,
  type ProfileDSManualDevicePrefData,
} from 'irene/models/profile';

type ProfileDsSelectFuncHandler = (option: { value: number }) => void;

export interface DevicePreferenceContext {
  projectProfile?: ProfileModel | null;

  dsAutomatedDevicePreference?: Partial<ProfileDSAutomatedDevicePrefData>;
  dsManualDevicePreference?: Partial<ProfileDSManualDevicePrefData>;

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

export default class ProjectPreferencesProviderComponent extends Component<ProjectPreferencesProviderSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked projectProfile?: ProfileModel | null = null;
  @tracked dsManualDevicePreference?: Partial<ProfileDSManualDevicePrefData>;

  @tracked
  dsAutomatedDevicePreference?: Partial<ProfileDSAutomatedDevicePrefData>;

  constructor(
    owner: unknown,
    args: ProjectPreferencesProviderSignature['Args']
  ) {
    super(owner, args);

    this.fetchProjectProfile.perform();
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
    } catch (error) {
      this.notify.error(this.intl.t('failedToUpdateDsManualDevicePref'));
    }
  });

  updateDsManualDevicePreference = task(
    async (data: SetProfileDSManualDevicePrefData) => {
      const dsManualDevicePreferenceCopy = this.dsManualDevicePreference;

      try {
        const dsManualDevicePreference =
          await this.projectProfile?.setDSManualDevicePrefData(data);

        this.dsManualDevicePreference = dsManualDevicePreference;

        this.notify.success(this.intl.t('savedPreferences'));
      } catch (error) {
        this.dsManualDevicePreference = dsManualDevicePreferenceCopy;

        this.notify.error(this.intl.t('errorFetchingDsManualDevicePref'));
      }
    }
  );

  updateDsAutomatedDevicePreference = task(
    async (data: SetProfileDSAutomatedDevicePrefData) => {
      const dsAutomatedDevicePreferenceCopy = this.dsAutomatedDevicePreference;

      try {
        const dsAutomatedDevicePreference =
          await this.projectProfile?.setDSAutomatedDevicePrefData(data);

        this.dsAutomatedDevicePreference = dsAutomatedDevicePreference;

        this.notify.success(this.intl.t('savedPreferences'));
      } catch (error) {
        this.dsAutomatedDevicePreference = dsAutomatedDevicePreferenceCopy;

        this.notify.error(this.intl.t('failedToUpdateDsAutomatedDevicePref'));
      }
    }
  );

  fetchDsAutomatedDevicePref = task(async () => {
    try {
      const dsAutomatedDevicePref =
        await this.projectProfile?.getDsAutomatedDevicePreference();

      this.dsAutomatedDevicePreference = dsAutomatedDevicePref;
    } catch (error) {
      this.notify.error(this.intl.t('errorFetchingDsAutomatedDevicePref'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectPreferences::Provider': typeof ProjectPreferencesProviderComponent;
  }
}
