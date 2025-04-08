import Component from '@glimmer/component';

import type { PrivacyModuleAppListQueryParam } from 'irene/routes/authenticated/dashboard/privacy-module/index';

export interface PrivacyModuleAppListSignature {
  Args: {
    queryParams: PrivacyModuleAppListQueryParam;
  };
}

export default class PrivacyModuleAppListComponent extends Component<PrivacyModuleAppListSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList': typeof PrivacyModuleAppListComponent;
  }
}
