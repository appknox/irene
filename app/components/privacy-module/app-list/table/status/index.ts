import Component from '@glimmer/component';
import ENUMS from 'irene/enums';
import PrivacyProjectModel from 'irene/models/privacy-project';

interface PrivacyModuleAppListTableStatusArgs {
  privacyProject: PrivacyProjectModel;
}

export default class PrivacyModuleAppListTableStatusComponent extends Component<PrivacyModuleAppListTableStatusArgs> {
  get platformIconClass() {
    return this.args.privacyProject?.project.get('platformIconClass');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Table::Status': typeof PrivacyModuleAppListTableStatusComponent;
  }
}
