import Component from '@glimmer/component';

function padTwoDigits(value: number): string {
  return String(Math.max(0, value)).padStart(2, '0');
}

export interface StoreReleaseReadinessSummaryStatusListSignature {
  Args: {
    failed: number;
    blocker: number;
    warning: number;
    passed: number;
    untested: number;
    passedValueLoading?: boolean;
    untestedValueLoading?: boolean;
  };
}

export default class StoreReleaseReadinessSummaryStatusListComponent extends Component<StoreReleaseReadinessSummaryStatusListSignature> {
  get failedPadded() {
    return padTwoDigits(this.args.failed);
  }

  get blockerPadded() {
    return padTwoDigits(this.args.blocker);
  }

  get warningPadded() {
    return padTwoDigits(this.args.warning);
  }

  get passedPadded() {
    return padTwoDigits(this.args.passed);
  }

  get untestedPadded() {
    return padTwoDigits(this.args.untested);
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
