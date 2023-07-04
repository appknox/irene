import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import AnalysisModel from 'irene/models/analysis';

export interface RiskTagSignature {
  Element: HTMLElement;
  Args: {
    analysis: AnalysisModel;
    label?: string;
    labelClass?: string;
    columnSize?: string;
  };
}

export default class RiskTagComponent extends Component<RiskTagSignature> {
  @service declare intl: IntlService;

  get analysis() {
    return this.args.analysis || null;
  }

  get riskLabelAndClassExists() {
    return this.args.label && this.args.labelClass;
  }

  get isNonPassedRiskOverridden() {
    return (
      this.analysis.overriddenRisk !== null &&
      this.analysis.risk !== ENUMS.RISK.NONE
    );
  }

  get analysisRiskStatus() {
    return analysisRiskStatus([
      String(this.analysis.computedRisk),
      String(this.analysis.status),
      this.analysis.isOverriddenRisk,
    ]);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    RiskTag: typeof RiskTagComponent;
  }
}
