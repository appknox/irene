import Component from '@glimmer/component';

import type ProjectModel from 'irene/models/project';
import type { DevicePreferenceContext } from './provider';

export interface ProjectPreferencesSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: number | string;
    platform?: number;
  };
  Blocks: {
    default: [dpContext: DevicePreferenceContext];
  };
}

export default class ProjectPreferencesComponent extends Component<ProjectPreferencesSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectPreferences: typeof ProjectPreferencesComponent;
  }
}
