import Component from '@glimmer/component';
import { DevicePreferenceContext } from '../provider';

export interface ProjectPreferencesOldDevicePreferenceSignature {
  Args: {
    dpContext: DevicePreferenceContext;
  };
  Blocks: {
    title: [];
  };
}

export default class ProjectPreferencesOldDevicePreferenceComponent extends Component<ProjectPreferencesOldDevicePreferenceSignature> {
  get isPreferredDeviceNotAvailable() {
    return this.args.dpContext.isPreferredDeviceAvailable === false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectPreferencesOld::DevicePreference': typeof ProjectPreferencesOldDevicePreferenceComponent;
    'project-preferences-old/device-preference': typeof ProjectPreferencesOldDevicePreferenceComponent;
  }
}
