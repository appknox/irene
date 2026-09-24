import Component from '@glimmer/component';
import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsFooterComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    saveAnalysis(backToFilePage: boolean): void;
    isSavingAnalysis: boolean;
    isSaveActionOnly: boolean;
    isDirty: boolean;
  };
}

export default class SecurityAnalysisDetailsFooterComponent extends Component<SecurityAnalysisDetailsFooterComponentSignature> {
  get isSaveDisabled() {
    return this.args.isSavingAnalysis || !this.args.isDirty;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Footer': typeof SecurityAnalysisDetailsFooterComponent;
  }
}
