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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'security/analysis-list/table/name': typeof SecurityAnalysisListTableNameComponent;
  }
}
