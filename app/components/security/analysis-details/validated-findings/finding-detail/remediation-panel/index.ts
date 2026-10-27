import Component from '@glimmer/component';

import { type SecurityValidatedFindingStep } from 'irene/utils/knoxiq-validated-findings';

import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';
import { type SecurityValidatedFindingPanelId } from '../index';

export interface SecurityAnalysisDetailsValidatedFindingsFindingDetailRemediationPanelSignature {
  Args: {
    finding: SecurityValidatedFindingModel;
    panelId: SecurityValidatedFindingPanelId;
    steps: SecurityValidatedFindingStep[];
    onStepsChange: (steps: SecurityValidatedFindingStep[]) => void;
    disabled?: boolean;
    isExpanded: boolean;
    onTogglePanel: (panel: SecurityValidatedFindingPanelId) => void;
    onSavePanel: (panel: SecurityValidatedFindingPanelId) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsFindingDetailRemediationPanelComponent extends Component<SecurityAnalysisDetailsValidatedFindingsFindingDetailRemediationPanelSignature> {
  get finding() {
    return this.args.finding;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::FindingDetail::RemediationPanel': typeof SecurityAnalysisDetailsValidatedFindingsFindingDetailRemediationPanelComponent;
  }
}
