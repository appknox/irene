import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import ENUMS from 'irene/enums';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type ProjectModel from 'irene/models/project';
import { type ProfileDSAutomatedDevicePrefData } from 'irene/models/profile';
import type AvailableAutomatedDeviceModel from 'irene/models/available-automated-device';

export interface ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastSignature {
  Args: {
    project?: ProjectModel | null;
  };
  Blocks: {
    title: [];
  };
}

export default class ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastComponent extends Component<ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked availableAutomatedDevices: AvailableAutomatedDeviceModel[] = [];

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastSignature['Args']
  ) {
    super(owner, args);

    this.fetchAvailableAutomatedDevicesTask.perform();
  }

  deviceSelectionTypes = ENUMS.DS_AUTOMATED_DEVICE_SELECTION.BASE_CHOICES;

  filterDsAutomatedDeviceCriteria =
    ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA;

  get minOSVersionOptions() {
    const platformVersions = this.availableAutomatedDevices.map(
      (it) => it.platformVersion
    );

    return ['', ...platformVersions.uniq()];
  }

  get isIOSApp() {
    return this.args.project?.platform === ENUMS.PLATFORM.IOS;
  }

  @action getChosenDeviceSelection(selectedDevice?: string | number) {
    return this.deviceSelectionTypes.find(
      (st) => String(st.value) === String(selectedDevice)
    );
  }

  @action
  getDeviceCapabilitiesOptionsData(
    dsAutoDevicePref?: Partial<ProfileDSAutomatedDevicePrefData>
  ) {
    return [
      {
        label: this.intl.t('sim'),
        id: 'ds_automated_sim_required',
        checked: !!dsAutoDevicePref?.ds_automated_sim_required,
      },
      {
        label: this.intl.t('vpn'),
        id: 'ds_automated_vpn_required',
        checked: !!dsAutoDevicePref?.ds_automated_vpn_required,
      },
      {
        label: this.intl.t('pinLock'),
        id: 'ds_automated_pin_lock_required',
        checked: !!dsAutoDevicePref?.ds_automated_pin_lock_required,
      },
    ];
  }

  fetchAvailableAutomatedDevicesTask = task(async () => {
    const adapter = this.store.adapterFor('available-automated-device');

    adapter.setNestedUrlNamespace(this.args.project?.id as string);

    const devices = await this.store.findAll('available-automated-device');

    this.availableAutomatedDevices = devices.slice();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::DevicePreferencesAutomatedDast': typeof ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastComponent;
  }
}
