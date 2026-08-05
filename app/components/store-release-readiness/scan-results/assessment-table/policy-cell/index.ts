import Component from '@glimmer/component';

import type { AssessmentPolicyRow } from '../..';

export interface StoreReleaseReadinessScanResultsAssessmentTablePolicyCellSignature {
  Element: HTMLDivElement;
  Args: {
    data: AssessmentPolicyRow;
  };
}

export default class StoreReleaseReadinessScanResultsAssessmentTablePolicyCellComponent extends Component<StoreReleaseReadinessScanResultsAssessmentTablePolicyCellSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::AssessmentTable::PolicyCell': typeof StoreReleaseReadinessScanResultsAssessmentTablePolicyCellComponent;
  }
}
