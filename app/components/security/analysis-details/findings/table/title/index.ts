import Component from '@glimmer/component';
import type { SecurityAnalysisFinding } from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsFindingsTableTitleComponentSignature {
  Args: {
    finding: SecurityAnalysisFinding;
  };
}

export default class SecurityAnalysisDetailsFindingsTableTitleComponent extends Component<SecurityAnalysisDetailsFindingsTableTitleComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'security/analysis-details/findings/table/title': typeof SecurityAnalysisDetailsFindingsTableTitleComponent;
  }
}
