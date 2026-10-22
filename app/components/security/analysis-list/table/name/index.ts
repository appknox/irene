import Component from '@glimmer/component';
import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisListTableNameComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel;
  };
}

export default class SecurityAnalysisListTableNameComponent extends Component<SecurityAnalysisListTableNameComponentSignature> {
  get vulnerabilityName() {
    return this.args.analysis?.vulnerability?.get('name');
  }

  // Flagged beside the name because the row's risk and exploitability both
  // still read as if the vulnerability were open.
  get isAllFalsePositive() {
    return Boolean(this.args.analysis?.isKnoxiqAllFp);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'security/analysis-list/table/name': typeof SecurityAnalysisListTableNameComponent;
  }
}
