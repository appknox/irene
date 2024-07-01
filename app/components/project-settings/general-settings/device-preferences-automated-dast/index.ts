import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';
import ProjectModel from 'irene/models/project';

export interface ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastComponent extends Component<ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastSignature> {
  @tracked selectedType: { label: string; value: boolean } | null = null;
  @tracked showTable = false;
  @tracked loaded = true;

  get preferenceType() {
    return [
      { label: 'Use any available device with criteria', value: false },
      { label: 'Use Specific device', value: true },
    ];
  }

  @action
  changed(selected: { label: string; value: boolean }) {
    this.selectedType = selected;
    this.showTable = selected.value;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::DevicePreferencesAutomatedDast': typeof ProjectSettingsGeneralSettingsDevicePreferencesAutomatedDastComponent;
  }
}
