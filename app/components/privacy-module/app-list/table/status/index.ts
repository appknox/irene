import Component from '@glimmer/component';

import type PrivacyProjectModel from 'irene/models/privacy-project';

interface PrivacyModuleAppListTableStatusArgs {
  privacyProject: PrivacyProjectModel;
}

export default class PrivacyModuleAppListTableStatusComponent extends Component<PrivacyModuleAppListTableStatusArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Table::Status': typeof PrivacyModuleAppListTableStatusComponent;
  }
}
