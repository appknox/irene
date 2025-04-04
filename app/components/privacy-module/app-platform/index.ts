import Component from '@glimmer/component';

import type FileModel from 'irene/models/file';

export interface PrivacyModuleAppPlatformSignature {
  Element: HTMLElement;
  Args: {
    file?: FileModel | null;
    bordered?: boolean;
  };
}

export default class PrivacyModuleAppPlatformComponent extends Component<PrivacyModuleAppPlatformSignature> {
  get platformIconClass() {
    return this.args.file?.project.get('platformIconClass');
  }

  get iconName() {
    return this.platformIconClass === 'apple' ? 'fa-brands:apple' : 'android';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppPlatform': typeof PrivacyModuleAppPlatformComponent;
  }
}
