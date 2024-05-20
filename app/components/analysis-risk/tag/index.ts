import { service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

export interface AnalysisRiskTagSignature {
  Element: HTMLElement;
  Args: {
    computedRisk: number;
    originalRisk?: number | null;
    overriddenRisk?: number | null;
    isOverridden?: boolean;
    disableOverriddenTooltip?: boolean;
    status?: number;
  };
}

export default class AnalysisRiskTagComponent extends Component<AnalysisRiskTagSignature> {
  @service declare intl: IntlService;

  get analysisRiskStatus() {
    return analysisRiskStatus([
      this.args.computedRisk,
      this.args.status ?? ENUMS.ANALYSIS.COMPLETED,
      Boolean(this.args.isOverridden),
    ]);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::Tag': typeof AnalysisRiskTagComponent;
  }
}
