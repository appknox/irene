import Component from '@glimmer/component';

import type { AssessmentPolicyRow } from '../..';

import './index.scss';

export interface StoreReleaseReadinessScanResultsAssessmentTableStatusCellSignature {
  Element: HTMLDivElement;
  Args: {
    data: AssessmentPolicyRow;
  };
}

export default class StoreReleaseReadinessScanResultsAssessmentTableStatusCellComponent extends Component<StoreReleaseReadinessScanResultsAssessmentTableStatusCellSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::AssessmentTable::StatusCell': typeof StoreReleaseReadinessScanResultsAssessmentTableStatusCellComponent;
  }
}
