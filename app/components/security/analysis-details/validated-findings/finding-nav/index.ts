import Component from '@glimmer/component';

import type { SecurityValidatedFindingPositionOption } from '../index';

export interface SecurityAnalysisDetailsValidatedFindingsFindingNavSignature {
  Args: {
    isFirstFinding: boolean;
    isLastFinding: boolean;
    formattedTotalFindings: string;
    positionOptions: SecurityValidatedFindingPositionOption[];
    selectedPositionOption: SecurityValidatedFindingPositionOption | null;
    onPrevious: () => void;
    onNext: () => void;
    onPositionSelect: (option: SecurityValidatedFindingPositionOption) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsFindingNavComponent extends Component<SecurityAnalysisDetailsValidatedFindingsFindingNavSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::FindingNav': typeof SecurityAnalysisDetailsValidatedFindingsFindingNavComponent;
  }
}
