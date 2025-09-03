import Component from '@glimmer/component';
import dayjs from 'dayjs';

import type PrivacyProjectModel from 'irene/models/privacy-project';

interface PrivacyModuleAppListTableLastScannedArgs {
  privacyProject: PrivacyProjectModel;
}

export default class PrivacyModuleAppListTableLastScannedComponent extends Component<PrivacyModuleAppListTableLastScannedArgs> {
  get lastScannedOn() {
    const scannedOn = this.args.privacyProject?.lastScannedOn;

    return dayjs(scannedOn).format('DD MMM YYYY');
  }

  get highlight() {
    return this.args.privacyProject?.highlight;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Table::LastScanned': typeof PrivacyModuleAppListTableLastScannedComponent;
  }
}
