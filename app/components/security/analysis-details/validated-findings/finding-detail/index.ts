import Component from '@glimmer/component';
import { action } from '@ember/object';

import {
  SECURITY_ANALYSIS_FINDING_CONFIDENCE,
  SECURITY_ANALYSIS_FINDING_LIKELIHOOD,
} from 'irene/models/security/analysis-finding';

import type SecurityAnalysisFindingModel from 'irene/models/security/analysis-finding';

import type {
  SecurityAnalysisFindingConfidence,
  SecurityAnalysisFindingLikelihood,
  SecurityAnalysisFindingStep,
} from 'irene/models/security/analysis-finding';

export const SECURITY_ANALYSIS_FINDING_PANEL = {
  REMEDIATION: 'remediation',
  STEPS_TO_REPRODUCE: 'steps-to-reproduce',
  EXPLOITABILITY: 'exploitability',
} as const;

export type SecurityAnalysisFindingPanelId =
  (typeof SECURITY_ANALYSIS_FINDING_PANEL)[keyof typeof SECURITY_ANALYSIS_FINDING_PANEL];

export interface SecurityAnalysisDetailsValidatedFindingsFindingDetailSignature {
  Args: {
    finding: SecurityAnalysisFindingModel;
    disabled?: boolean;
    areAllPanelsOpen: boolean;
    isPanelOpen: (panel: SecurityAnalysisFindingPanelId) => boolean;
    onTogglePanel: (panel: SecurityAnalysisFindingPanelId) => void;
    onToggleExpandAll: () => void;
    onSavePanel: (panel: SecurityAnalysisFindingPanelId) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsFindingDetailComponent extends Component<SecurityAnalysisDetailsValidatedFindingsFindingDetailSignature> {
  readonly panel = SECURITY_ANALYSIS_FINDING_PANEL;

  readonly confidenceOptions: SecurityAnalysisFindingConfidence[] = [
    ...SECURITY_ANALYSIS_FINDING_CONFIDENCE,
  ];

  readonly likelihoodOptions: SecurityAnalysisFindingLikelihood[] = [
    ...SECURITY_ANALYSIS_FINDING_LIKELIHOOD,
  ];

  get finding() {
    return this.args.finding;
  }

  get validation() {
    return this.finding.validation;
  }

  get exploitability() {
    return this.finding.exploitability;
  }

  get remediationSteps() {
    return this.finding.remediationSteps;
  }

  get reproductionSteps() {
    return this.finding.reproductionSteps;
  }

  // Every attr is a plain object, so each edit replaces the whole blob rather
  // than mutating it in place.
  updateValidation(changes: Partial<typeof this.validation>) {
    this.finding.set('validation', { ...this.validation, ...changes });
  }

  updateExploitability(changes: Partial<typeof this.exploitability>) {
    this.finding.set('exploitability', { ...this.exploitability, ...changes });
  }

  @action
  selectConfidence(confidence: SecurityAnalysisFindingConfidence) {
    this.updateValidation({ confidence_label: confidence });
  }

  @action
  updateSummary(event: Event) {
    this.updateValidation({
      finding_summary: (event.target as HTMLTextAreaElement).value,
    });
  }

  @action
  updateEvidence(evidence: string) {
    this.updateValidation({ evidence });
  }

  @action
  updateReasoning(reasoning: string) {
    this.updateValidation({ reasoning });
  }

  @action
  updateRemediationSteps(steps: SecurityAnalysisFindingStep[]) {
    this.finding.set('remediation', { steps });
  }

  @action
  updateReproductionSteps(steps: SecurityAnalysisFindingStep[]) {
    this.finding.set('poc', { steps });
  }

  @action
  selectLikelihood(likelihood: SecurityAnalysisFindingLikelihood) {
    this.updateExploitability({ exploitability_likelihood: likelihood });
  }

  @action
  updateExploitabilityBody(body: string) {
    this.updateExploitability({ exploitability_analysis: { body } });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::FindingDetail': typeof SecurityAnalysisDetailsValidatedFindingsFindingDetailComponent;
  }
}
