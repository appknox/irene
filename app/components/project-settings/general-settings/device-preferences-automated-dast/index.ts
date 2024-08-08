import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import ENUMS from 'irene/enums';

import type IntlService from 'ember-intl/services/intl';
import type ProjectModel from 'irene/models/project';
import { type ProfileDSAutomatedDevicePrefData } from 'irene/models/profile';

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

  deviceSelectionTypes = ENUMS.DS_AUTOMATED_DEVICE_SELECTION.BASE_CHOICES;

  filterDsAutomatedDeviceCriteria =
    ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA;

  get isIOSApp() {
    return this.args.project?.platform === ENUMS.PLATFORM.IOS;
  }

  // TODO: Values to be updated in the future when DAST is supported on prem
  get minOSVersionOptions() {
    return this.isIOSApp ? ['13', '14', '15', '16'] : ['9', '10', '12', '13'];
  }

  @action getChosenDeviceSelection(selectedDevice?: number) {
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::DevicePreferencesAutomatedDast': typeof ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastComponent;
  }
}
