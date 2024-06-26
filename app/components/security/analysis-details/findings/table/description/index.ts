import Component from '@glimmer/component';
import type { SecurityAnalysisFinding } from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsFindingsTableDescriptionComponentSignature {
  Args: {
    finding: SecurityAnalysisFinding;
  };
}

export default class SecurityAnalysisDetailsFindingsTableDescriptionComponent extends Component<SecurityAnalysisDetailsFindingsTableDescriptionComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'security/analysis-details/findings/table/description': typeof SecurityAnalysisDetailsFindingsTableDescriptionComponent;
  }
}
