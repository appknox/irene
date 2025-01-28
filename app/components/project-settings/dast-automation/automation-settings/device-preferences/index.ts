import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import ENUMS from 'irene/enums';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type ProjectModel from 'irene/models/project';
import type AvailableAutomatedDeviceModel from 'irene/models/available-automated-device';
import type { DsPreferenceContext } from 'irene/components/ds-preference-provider';
import type DsAutomatedDevicePreferenceModel from 'irene/models/ds-automated-device-preference';

export interface ProjectSettingsDastAutomationAutomationSettingsDevicePreferencesSignature {
  Args: {
    project?: ProjectModel | null;
    dpContext: DsPreferenceContext;
  };
  Blocks: {
    title: [];
  };
}

export default class ProjectSettingsDastAutomationAutomationSettingsDevicePreferencesComponent extends Component<ProjectSettingsDastAutomationAutomationSettingsDevicePreferencesSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked availableAutomatedDevices: AvailableAutomatedDeviceModel[] = [];

  deviceSelectionTypes = ENUMS.DS_AUTOMATED_DEVICE_SELECTION.BASE_CHOICES;

  constructor(
    owner: unknown,
    args: ProjectSettingsDastAutomationAutomationSettingsDevicePreferencesSignature['Args']
  ) {
    super(owner, args);

    this.fetchAvailableAutomatedDevicesTask.perform();
  }

  get dpContext() {
    return this.args.dpContext;
  }

  get devicePreference() {
    return this.dpContext.dsAutomatedDevicePreference;
  }

  get minOSVersionOptions() {
    const platformVersions = this.availableAutomatedDevices.map(
      (it) => it.platformVersion
    );

    return ['', ...platformVersions.uniq()];
  }

  get isIOSApp() {
    return this.args.project?.platform === ENUMS.PLATFORM.IOS;
  }

  get chosenDeviceSelection() {
    return this.deviceSelectionTypes.find(
      (st) =>
        String(st.value) ===
        String(this.devicePreference?.dsAutomatedDeviceSelection)
    );
  }

  get filterAutomatedDeviceSelection() {
    return (
      this.devicePreference?.dsAutomatedDeviceSelection ===
      ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA
    );
  }

  // get deviceCapabilitiesOptions() {
  //   return [
  //     {
  //       label: this.intl.t('sim'),
  //       id: 'ds_automated_sim_required',
  //       checked: !!this.devicePreference?.dsAutomatedSimRequired,
  //     },
  //     {
  //       label: this.intl.t('vpn'),
  //       id: 'ds_automated_vpn_required',
  //       checked: !!this.devicePreference?.dsAutomatedVpnRequired,
  //     },
  //     {
  //       label: this.intl.t('pinLock'),
  //       id: 'ds_automated_pin_lock_required',
  //       checked: !!this.devicePreference?.dsAutomatedPinLockRequired,
  //     },
  //   ];
  // }

  @action
  handleSelectDeviceType(event: Event, type: string) {
    const preference = this
      .devicePreference as DsAutomatedDevicePreferenceModel;

    preference.dsAutomatedDeviceType = Number(type);

    this.dpContext.updateDsAutomatedDevicePref(preference);
  }

  @action
  handleDsAutomatedMinOSVersionSelect(opt: string) {
    const preference = this
      .devicePreference as DsAutomatedDevicePreferenceModel;

    preference.dsAutomatedPlatformVersionMin = opt;

    this.dpContext.updateDsAutomatedDevicePref(preference);
  }

  @action
  handleDsAutomatedDeviceSelection(option: { value: number }) {
    const preference = this
      .devicePreference as DsAutomatedDevicePreferenceModel;

    preference.dsAutomatedDeviceSelection = option.value;

    this.dpContext.updateDsAutomatedDevicePref(preference);
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
    'ProjectSettings::DastAutomation::AutomationSettings::DevicePreferences': typeof ProjectSettingsDastAutomationAutomationSettingsDevicePreferencesComponent;
  }
}
