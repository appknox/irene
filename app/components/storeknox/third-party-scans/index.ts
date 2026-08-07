import Component from '@glimmer/component';
import { service } from '@ember/service';

import type SkThirdPartyAppsService from 'irene/services/sk-third-party-apps';
import type SkThirdPartyConfigModel from 'irene/models/sk-third-party-config';

interface Signature {
  Args: {
    config: SkThirdPartyConfigModel | null;
  };
}

export default class StoreknoxThirdPartyScansComponent extends Component<Signature> {
  @service('sk-third-party-apps')
  declare skThirdPartyApps: SkThirdPartyAppsService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ThirdPartyScans': typeof StoreknoxThirdPartyScansComponent;
  }
}
