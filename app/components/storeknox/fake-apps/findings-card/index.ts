import { capitalize } from '@ember/string';
import Component from '@glimmer/component';

export interface StoreknoxFakeAppsFindingsCardSignature {
  Args: {
    title?: string;
    info?: string;
    isDefaultFinding?: boolean;
    score?: number | string;
    description?: string;
    isIgnored?: boolean;
  };
}

export default class StoreknoxFakeAppsFindingsCardComponent extends Component<StoreknoxFakeAppsFindingsCardSignature> {
  get score() {
    if (typeof this.args.score === 'string') {
      return capitalize(this.args.score.toLowerCase());
    } else if (typeof this.args.score === 'number') {
      return this.args.score ? `${(this.args.score * 100).toFixed(0)}%` : '0%';
    } else {
      return undefined;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FindingsCard': typeof StoreknoxFakeAppsFindingsCardComponent;
  }
}
