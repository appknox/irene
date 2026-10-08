import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type IntlService from 'ember-intl/services/intl';

import {
  CONFIDENCE_VALUES,
  EXPLOITABILITY_LIKELIHOOD_VALUES,
  type ManualFindingStep,
} from 'irene/utils/manual-validated-findings';

import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';

export const SECURITY_VALIDATED_FINDING_PANEL = {
  REMEDIATION: 'remediation',
  STEPS_TO_REPRODUCE: 'steps-to-reproduce',
  EXPLOITABILITY: 'exploitability',
} as const;

export type SecurityValidatedFindingPanelId =
  (typeof SECURITY_VALIDATED_FINDING_PANEL)[keyof typeof SECURITY_VALIDATED_FINDING_PANEL];

export interface SecurityAnalysisDetailsValidatedFindingsFindingDetailSignature {
  Args: {
    finding: SecurityValidatedFindingModel;
    disabled?: boolean;
    areAllPanelsOpen: boolean;
    isPanelOpen: (panel: SecurityValidatedFindingPanelId) => boolean;
    onTogglePanel: (panel: SecurityValidatedFindingPanelId) => void;
    onToggleExpandAll: () => void;
    onSavePanel: (panel: SecurityValidatedFindingPanelId) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsFindingDetailComponent extends Component<SecurityAnalysisDetailsValidatedFindingsFindingDetailSignature> {
  @service declare intl: IntlService;

  // evidence is a string[] on the wire and a bullet list in the editor, so
  // reading it back regenerates html that tiptap would re-serialize
  // differently. Holding what the editor produced keeps the two in step and
  // stops the sync from writing to the record mid-render.
  @tracked evidenceDraft: string | null = null;
  @tracked evidenceDraftFindingId: string | null = null;

  readonly panel = SECURITY_VALIDATED_FINDING_PANEL;

  // The API scores both on the same -1/1/2/3 scale, so the option values are
  // the integers it accepts and the labels are translated on render.
  readonly confidenceOptions: number[] = [...CONFIDENCE_VALUES];
  readonly likelihoodOptions: number[] = [...EXPLOITABILITY_LIKELIHOOD_VALUES];

  get finding() {
    return this.args.finding;
  }

  get evidenceHtml() {
    const isDraftForThisFinding =
      this.evidenceDraft !== null &&
      this.evidenceDraftFindingId === this.finding.id;

    return isDraftForThisFinding
      ? (this.evidenceDraft as string)
      : this.finding.evidenceHtml;
  }

  @action
  scaleLabel(value: number) {
    return this.intl.t(
      `securityAnalysisDetails.validatedFindings.scale.${value}`
    );
  }

  @action
  selectConfidence(confidence: number) {
    this.finding.confidence = confidence;
  }

  @action
  updateSummary(event: Event) {
    this.finding.summary = (event.target as HTMLTextAreaElement).value;
  }

  @action
  updateEvidence(evidence: string) {
    this.evidenceDraft = evidence;
    this.evidenceDraftFindingId = this.finding.id;

    this.finding.evidenceHtml = evidence;
  }

  @action
  updateReasoning(reasoning: string) {
    this.finding.reasoning = reasoning;
  }

  @action
  updateRemediationSteps(steps: ManualFindingStep[]) {
    this.finding.remediationSteps = steps;
  }

  @action
  updateReproductionSteps(steps: ManualFindingStep[]) {
    this.finding.stepsToReproduce = steps;
  }

  @action
  selectLikelihood(likelihood: number) {
    this.finding.exploitabilityLikelihood = likelihood;
  }

  @action
  updateExploitabilityBody(body: string) {
    this.finding.exploitabilityAnalysis = body;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::FindingDetail': typeof SecurityAnalysisDetailsValidatedFindingsFindingDetailComponent;
  }
}
