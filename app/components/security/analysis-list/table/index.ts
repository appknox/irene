import Component from '@glimmer/component';

import type SecurityFileModel from 'irene/models/security/file';
import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisListTableComponentSignature {
  Args: {
    analyses: SecurityAnalysisModel[];
    file: SecurityFileModel;
    vulnSearchResultIsEmpty: boolean;
    isFetchingAnalyses: boolean;
  };
}

export default class SecurityAnalysisListTableComponent extends Component<SecurityAnalysisListTableComponentSignature> {
  get file() {
    return this.args.file;
  }

  // Scanned files keep showing their exploitability after the organization
  // turns KnoxIQ off — the flag gates writing, not reading.
  get isKnoxIqFile() {
    return Boolean(this.args.file?.isKnoxiqFile);
  }

  get columns() {
    return [
      {
        name: 'Analysis ID',
        valuePath: 'id',
        width: 70,
        textAlign: 'left',
      },
      {
        name: 'Vulnerability',
        width: 180,
        component: 'security/analysis-list/table/name',
        valuePath: 'vulnerability.name',
        isSortable: true,
        textAlign: 'left',
      },
      {
        name: 'Risk',
        width: 90,
        component: 'security/analysis-list/table/risk',
        textAlign: 'left',
      },
      ...(this.isKnoxIqFile
        ? [
            {
              name: 'Exploitability',
              width: 90,
              component: 'security/analysis-list/table/exploitability',
              textAlign: 'left',
            },
          ]
        : []),
      {
        name: 'Scan Type',
        width: 100,
        component: 'security/analysis-list/table/scan-type',
        textAlign: 'left',
      },
      {
        name: 'Status',
        component: 'security/analysis-list/table/status',
        width: 80,
        textAlign: 'center',
      },
      {
        name: 'Action',
        component: 'security/analysis-list/table/action',
        width: 50,
        textAlign: 'center',
      },
    ];
  }

  get analysisListIsEmpty() {
    return (
      !this.args.vulnSearchResultIsEmpty &&
      !this.args.isFetchingAnalyses &&
      this.args.analyses.length < 1
    );
  }

  get showEmptyStateUI() {
    return this.args.vulnSearchResultIsEmpty || this.analysisListIsEmpty;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisList::Table': typeof SecurityAnalysisListTableComponent;
  }
}
