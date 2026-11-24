import Component from '@glimmer/component';

import platformIconClass from 'irene/utils/platform-icon-class';
import type PrivacyProjectModel from 'irene/models/privacy-project';

interface PrivacyModuleAppListTablePlatformArgs {
  privacyProject: PrivacyProjectModel;
}

export default class PrivacyModuleAppListTablePlatformComponent extends Component<PrivacyModuleAppListTablePlatformArgs> {
  get platformIconClass() {
    const platform = this.args.privacyProject?.platform;

    if (platform !== undefined && platform !== null) {
      return platformIconClass(platform);
    }

    return this.args.privacyProject?.project.get('platformIconClass');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Table::Platform': typeof PrivacyModuleAppListTablePlatformComponent;
  }
}
