import Component from '@glimmer/component';

import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';

export interface PrivacyModuleAppPlatformSignature {
  Element: HTMLElement;
  Args: {
    file?: FileModel | null;
    bordered?: boolean;
    project?: ProjectModel | null;
  };
}

export default class PrivacyModuleAppPlatformComponent extends Component<PrivacyModuleAppPlatformSignature> {
  get platformIconClass() {
    return this.args.project?.get('platformIconClass');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppPlatform': typeof PrivacyModuleAppPlatformComponent;
  }
}
