import Component from '@glimmer/component';
import { WithBoundArgs } from '@glint/template';

import ProjectModel from 'irene/models/project';
import ProjectPreferencesDevicePreferenceComponent from './device-preference';

export interface ProjectPreferencesOldSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: number | string;
    platform?: number;
  };
  Blocks: {
    default: [
      {
        DevicePreferenceComponent: WithBoundArgs<
          typeof ProjectPreferencesDevicePreferenceComponent,
          'dpContext'
        >;
      },
    ];
  };
}

export default class ProjectPreferencesOldComponent extends Component<ProjectPreferencesOldSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectPreferencesOld: typeof ProjectPreferencesOldComponent;
  }
}
