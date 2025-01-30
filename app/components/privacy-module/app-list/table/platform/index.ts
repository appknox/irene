import Component from '@glimmer/component';

import type PrivacyProjectModel from 'irene/models/privacy-project';

interface PrivacyModuleAppListTablePlatformArgs {
  privacyProject: PrivacyProjectModel;
}

export default class PrivacyModuleAppListTablePlatformComponent extends Component<PrivacyModuleAppListTablePlatformArgs> {
  get platformIconClass() {
    return this.args.privacyProject?.project.get('platformIconClass');
  }

  get iconName() {
    return this.platformIconClass
      ? this.platformIconClass === 'apple'
        ? 'fa-brands:apple'
        : 'android'
      : undefined;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Table::Platform': typeof PrivacyModuleAppListTablePlatformComponent;
  }
}
