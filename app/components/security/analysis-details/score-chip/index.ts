import Component from '@glimmer/component';

import type { RiskLabelClass } from 'irene/helpers/risk-class';

export interface SecurityAnalysisDetailsScoreChipSignature {
  Element: HTMLElement;
  Args: {
    score?: string | number;
    label?: string;
    caption?: string;
    riskClass?: RiskLabelClass;
    isInvalid?: boolean;
    invalidLabel?: string;
    testId?: string;
  };
}

export default class SecurityAnalysisDetailsScoreChipComponent extends Component<SecurityAnalysisDetailsScoreChipSignature> {
  get boxClass() {
    return this.args.isInvalid ? 'is-error' : (this.args.riskClass ?? '');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ScoreChip': typeof SecurityAnalysisDetailsScoreChipComponent;
  }
}
