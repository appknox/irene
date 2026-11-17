import Component from '@glimmer/component';

import styles from './index.scss';

import type { SecurityAnalysisFinding } from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsValidatedFindingsOriginalAnalysisDrawerSignature {
  Args: {
    open: boolean;
    findings?: SecurityAnalysisFinding[];
    onClose: () => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsOriginalAnalysisDrawerComponent extends Component<SecurityAnalysisDetailsValidatedFindingsOriginalAnalysisDrawerSignature> {
  get classes() {
    return { drawerContainer: styles['drawer-container'] };
  }

  get findings() {
    return this.args.findings ?? [];
  }

  get hasFindings() {
    return this.findings.length > 0;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::OriginalAnalysisDrawer': typeof SecurityAnalysisDetailsValidatedFindingsOriginalAnalysisDrawerComponent;
  }
}
