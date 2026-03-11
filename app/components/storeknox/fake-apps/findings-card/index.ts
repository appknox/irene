import Component from '@glimmer/component';

export interface StoreknoxFakeAppsFindingsCardSignature {
  Args: {
    title?: string;
    isDefaultFinding?: boolean;
    score?: number;
    description?: string;
    isIgnored?: boolean;
    isSemanticFinding?: boolean;
  };
}

export default class StoreknoxFakeAppsFindingsCardComponent extends Component<StoreknoxFakeAppsFindingsCardSignature> {
  get scorePercentage() {
    return this.args.score ? `${(this.args.score * 100).toFixed(0)}%` : '0%';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FindingsCard': typeof StoreknoxFakeAppsFindingsCardComponent;
  }
}
