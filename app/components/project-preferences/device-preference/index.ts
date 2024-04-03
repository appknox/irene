import Component from '@glimmer/component';
import { DevicePreferenceContext } from '../provider';

export interface ProjectPreferencesDevicePreferenceSignature {
  Args: {
    dpContext: DevicePreferenceContext;
  };
  Blocks: {
    title: [];
  };
}

export default class ProjectPreferencesDevicePreferenceComponent extends Component<ProjectPreferencesDevicePreferenceSignature> {
  get isPreferredDeviceNotAvailable() {
    return this.args.dpContext.isPreferredDeviceAvailable === false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectPreferences::DevicePreference': typeof ProjectPreferencesDevicePreferenceComponent;
    'project-preferences/device-preference': typeof ProjectPreferencesDevicePreferenceComponent;
  }
}
