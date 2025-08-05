import Component from '@glimmer/component';

import type PiiModel from 'irene/models/pii';

export interface PrivacyModuleAppDetailsPiiTableCategorySignature {
  Args: {
    data: PiiModel;
  };
}

export default class PrivacyModuleAppDetailsPiiTableCategoryComponent extends Component<PrivacyModuleAppDetailsPiiTableCategorySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Pii::Table::Category': typeof PrivacyModuleAppDetailsPiiTableCategoryComponent;
  }
}
