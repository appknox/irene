import Component from '@glimmer/component';
import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsIgnoreBaselineOptionComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    checked: boolean;
    disabled?: boolean;
    onChange: (event: Event, checked: boolean) => void;
  };
}

export default class SecurityAnalysisDetailsIgnoreBaselineOptionComponent extends Component<SecurityAnalysisDetailsIgnoreBaselineOptionComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::IgnoreBaselineOption': typeof SecurityAnalysisDetailsIgnoreBaselineOptionComponent;
  }
}
