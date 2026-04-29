import Component from '@glimmer/component';

import type { AssessmentPolicyRow } from '../..';

import './index.scss';

export interface StoreReleaseReadinessScanResultsAssessmentTableStatusCellSignature {
  Element: HTMLDivElement;
  Args: {
    data: AssessmentPolicyRow;
    showOverriddenEditIcon?: boolean;
  };
}

export default class StoreReleaseReadinessScanResultsAssessmentTableStatusCellComponent extends Component<StoreReleaseReadinessScanResultsAssessmentTableStatusCellSignature> {
  get showOverriddenEditIcon() {
    return this.args.showOverriddenEditIcon ?? true;
  }

  get showEditIcon() {
    return this.args.data.isOverridden && this.showOverriddenEditIcon;
  }

  get showFailedToPassIcon() {
    return this.args.data.isOverridden && !this.showOverriddenEditIcon;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::AssessmentTable::StatusCell': typeof StoreReleaseReadinessScanResultsAssessmentTableStatusCellComponent;
  }
}
