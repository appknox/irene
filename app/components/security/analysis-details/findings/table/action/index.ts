import Component from '@glimmer/component';
import type { SecurityAnalysisFinding } from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsFindingsTableActionComponentSignature {
  Args: {
    finding: SecurityAnalysisFinding;
    openRemoveFindingConfirmBox(findindId?: number): void;
  };
}

export default class SecurityAnalysisDetailsFindingsTableActionComponent extends Component<SecurityAnalysisDetailsFindingsTableActionComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'security/analysis-details/findings/table/action': typeof SecurityAnalysisDetailsFindingsTableActionComponent;
  }
}
