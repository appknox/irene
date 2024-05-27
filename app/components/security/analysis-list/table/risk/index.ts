import Component from '@glimmer/component';
import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisListTableRiskComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel;
  };
}

export default class SecurityAnalysisListTableRiskComponent extends Component<SecurityAnalysisListTableRiskComponentSignature> {
  get analysis() {
    return this.args.analysis;
  }

  get overridenRisk() {
    return this.analysis.overriddenRisk;
  }

  get riskIsOverriden() {
    return this.overridenRisk !== null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'security/analysis-list/table/risk': typeof SecurityAnalysisListTableRiskComponent;
  }
}
