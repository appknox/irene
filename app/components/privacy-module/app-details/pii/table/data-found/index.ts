import Component from '@glimmer/component';

import type PiiModel from 'irene/models/pii';

export interface PrivacyModuleAppDetailsPiiTableDataFoundSignature {
  Args: {
    data: PiiModel;
  };
}

export default class PrivacyModuleAppDetailsPiiTableDataFoundComponent extends Component<PrivacyModuleAppDetailsPiiTableDataFoundSignature> {
  get dataFound() {
    return this.args.data.piiData;
  }

  get value() {
    return this.dataFound[0]?.value;
  }

  get showChip() {
    return this.dataFound.length > 1;
  }

  get chipValue() {
    const number = this.dataFound.length - 1;

    return `+${number} more`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Pii::Table::DataFound': typeof PrivacyModuleAppDetailsPiiTableDataFoundComponent;
  }
}
