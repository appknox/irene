import Component from '@glimmer/component';

export interface StoreReleaseReadinessSummaryStatusListSignature {
  Args: {
    failed: number;
    blocker: number;
    warning: number;
    passed: number;
    untested: number;
    overridden?: number;
    passedValueLoading?: boolean;
    untestedValueLoading?: boolean;
  };
}

export default class StoreReleaseReadinessSummaryStatusListComponent extends Component<StoreReleaseReadinessSummaryStatusListSignature> {
  get overriddenCount() {
    return this.args.overridden ?? 0;
  }

  get isOverridden() {
    return this.overriddenCount > 0;
  }

  get passedValueLoading() {
    return Boolean(this.args.passedValueLoading);
  }

  get untestedValueLoading() {
    return Boolean(this.args.untestedValueLoading);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ReleaseCard::SummaryStatusList': typeof StoreReleaseReadinessSummaryStatusListComponent;
  }
}
