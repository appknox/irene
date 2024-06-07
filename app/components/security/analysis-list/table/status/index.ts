import Component from '@glimmer/component';
import ENUMS from 'irene/enums';

import type { AkChipColor } from 'irene/components/ak-chip';
import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisListTableStatusComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel;
  };
}

export default class SecurityAnalysisListTableStatusComponent extends Component<SecurityAnalysisListTableStatusComponentSignature> {
  analysisIsRunning = ENUMS.ANALYSIS_STATUS.RUNNING;

  get analysis() {
    return this.args.analysis;
  }

  get analysisStatus() {
    return this.analysis.status;
  }

  get analysisStatusDetails() {
    const statuses = {
      [ENUMS.ANALYSIS_STATUS.ERROR]: {
        label: 'Errored',
        color: 'error',
      },
      [ENUMS.ANALYSIS_STATUS.WAITING]: {
        label: 'Not started',
        color: 'secondary',
      },
      [ENUMS.ANALYSIS_STATUS.RUNNING]: {
        label: 'Scanning',
        color: 'default',
      },
      [ENUMS.ANALYSIS_STATUS.COMPLETED]: {
        label: 'Completed',
        color: 'success',
      },
      [ENUMS.ANALYSIS_STATUS.UNKNOWN]: {
        label: 'Unknown',
        color: 'secondary',
      },
    };

    return statuses[this.analysisStatus] as {
      label: string;
      color: AkChipColor;
    };
  }

  get statusVariant() {
    return this.analysisStatusDetails?.label === 'Unknown'
      ? 'filled'
      : 'outlined';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'security/analysis-list/table/status': typeof SecurityAnalysisListTableStatusComponent;
  }
}
