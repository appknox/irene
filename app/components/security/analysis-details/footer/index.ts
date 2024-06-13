import Component from '@glimmer/component';
import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsFooterComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    saveAnalysis(backToFilePage: boolean): void;
    isSavingAnalysis: boolean;
    isSaveActionOnly: boolean;
  };
}

export default class SecurityAnalysisDetailsFooterComponent extends Component<SecurityAnalysisDetailsFooterComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Footer': typeof SecurityAnalysisDetailsFooterComponent;
  }
}
