import { action } from '@ember/object';
import Component from '@glimmer/component';
import ENUMS from 'irene/enums';
import { ProfileDsAutomatedDeviceSelection } from 'irene/models/profile';

import type ProjectModel from 'irene/models/project';

export interface ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastSignature {
  Args: {
    project?: ProjectModel;
  };
  Blocks: {
    title: [];
  };
}

export default class ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastComponent extends Component<ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastSignature> {
  filterDsAutomatedDeviceCriteria =
    ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA;

  deviceSelectionTypes = ENUMS.DS_AUTOMATED_DEVICE_SELECTION.BASE_CHOICES;

  loaded = true;

  @action getChosenDeviceSelection(
    selectedDevice?: ProfileDsAutomatedDeviceSelection
  ) {
    return this.deviceSelectionTypes.find((st) => st.value === selectedDevice);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::DevicePreferencesAutomatedDast': typeof ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastComponent;
  }
}
