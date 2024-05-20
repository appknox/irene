import Component from '@glimmer/component';
import { TypographyFontWeight } from 'irene/components/ak-typography';
import { riskText } from 'irene/helpers/risk-text';

export interface AnalysisRiskTextSignature {
  Element: HTMLSpanElement;
  Args: {
    fontWeight?: TypographyFontWeight;
    risk?: number | null;
  };
}

export default class AnalysisRiskTextComponent extends Component<AnalysisRiskTextSignature> {
  get fontWeight() {
    return this.args.fontWeight || 'bold';
  }

  get riskText() {
    return riskText([this.args.risk as number]) || 'untested';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::Text': typeof AnalysisRiskTextComponent;
  }
}
