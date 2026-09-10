import Component from '@glimmer/component';

import type SkThirdPartyAppModel from 'irene/models/sk-third-party-app';

interface StoreknoxThirdPartyScansAppDetailsSignature {
  Args: {
    app: SkThirdPartyAppModel;
    selectedVersion: string;
  };
}

export default class StoreknoxThirdPartyScansAppDetailsComponent extends Component<StoreknoxThirdPartyScansAppDetailsSignature> {
  get hasScore() {
    return this.args.app?.score !== null && this.args.app?.score !== undefined;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ThirdPartyScans::AppDetails': typeof StoreknoxThirdPartyScansAppDetailsComponent;
  }
}
