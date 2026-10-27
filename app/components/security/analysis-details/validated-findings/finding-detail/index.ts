import Component from '@glimmer/component';

import { type SecurityValidatedFindingStep } from 'irene/utils/knoxiq-validated-findings';

import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';

export const SECURITY_VALIDATED_FINDING_PANEL = {
  AEIS: 'aeis',
  REMEDIATION: 'remediation',
  STEPS_TO_REPRODUCE: 'steps-to-reproduce',
  EXPLOITABILITY: 'exploitability',
} as const;

export type SecurityValidatedFindingPanelId =
  (typeof SECURITY_VALIDATED_FINDING_PANEL)[keyof typeof SECURITY_VALIDATED_FINDING_PANEL];

export interface SecurityAnalysisDetailsValidatedFindingsFindingDetailSignature {
  Args: {
    finding: SecurityValidatedFindingModel;
    remediationSteps: SecurityValidatedFindingStep[];
    stepsToReproduce: SecurityValidatedFindingStep[];
    onRemediationStepsChange: (steps: SecurityValidatedFindingStep[]) => void;
    onReproductionStepsChange: (steps: SecurityValidatedFindingStep[]) => void;
    disabled?: boolean;
    // List fields that failed the last save attempt, marked in red.
    invalidListFields?: string[];
    areAllPanelsOpen: boolean;
    isPanelOpen: (panel: SecurityValidatedFindingPanelId) => boolean;
    onTogglePanel: (panel: SecurityValidatedFindingPanelId) => void;
    onToggleExpandAll: () => void;
    onSavePanel: (panel: SecurityValidatedFindingPanelId) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsFindingDetailComponent extends Component<SecurityAnalysisDetailsValidatedFindingsFindingDetailSignature> {
  readonly panel = SECURITY_VALIDATED_FINDING_PANEL;

  get finding() {
    return this.args.finding;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::FindingDetail': typeof SecurityAnalysisDetailsValidatedFindingsFindingDetailComponent;
  }
}
