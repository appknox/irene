import Component from '@glimmer/component';

import SecurityAnalysisModel, {
  type SecurityAnalysisFinding,
} from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsFindingsTableComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    allFindings: SecurityAnalysisFinding[] | null;
    openRemoveFindingConfirmBox(findindId?: number): void;
  };
}

export default class SecurityAnalysisDetailsFindingsTableComponent extends Component<SecurityAnalysisDetailsFindingsTableComponentSignature> {
  get columns() {
    return [
      {
        name: 'Title',
        width: 70,
        textAlign: 'left',
        component: 'security/analysis-details/findings/table/title',
      },
      {
        name: 'Description',
        width: 180,
        component: 'security/analysis-details/findings/table/description',
        textAlign: 'left',
      },
      {
        name: 'Action',
        component: 'security/analysis-details/findings/table/action',
        textAlign: 'right',
      },
    ];
  }

  get analysis() {
    return this.args.analysis;
  }

  get allFindings() {
    return this.args.allFindings?.slice();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Findings::Table': typeof SecurityAnalysisDetailsFindingsTableComponent;
  }
}
