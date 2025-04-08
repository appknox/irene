import Component from '@glimmer/component';
import type PrivacyProjectModel from 'irene/models/privacy-project';

interface PrivacyModuleAppListTableApplicationArgs {
  privacyProject: PrivacyProjectModel;
}

export default class PrivacyModuleAppListTableApplicationComponent extends Component<PrivacyModuleAppListTableApplicationArgs> {
  get packageName() {
    return this.args.privacyProject.project.get('packageName');
  }

  get name() {
    return this.args.privacyProject.latestFile.get('name');
  }

  get iconUrl() {
    return this.args.privacyProject.latestFile.get('iconUrl');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Table::Application': typeof PrivacyModuleAppListTableApplicationComponent;
  }
}
