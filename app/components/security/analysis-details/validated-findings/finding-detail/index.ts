import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import { riskClass } from 'irene/helpers/risk-class';

import {
  CONFIDENCE_VALUES,
  EXPLOITABILITY_LIKELIHOOD_VALUES,
  buildExploitability,
  buildValidation,
  type SecurityValidatedFindingExploitabilityEdit,
  type SecurityValidatedFindingStep,
  type SecurityValidatedFindingValidationEdit,
} from 'irene/utils/knoxiq-validated-findings';

import {
  SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS,
  SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES,
  buildFullSignals,
  humanizeAeisSignalKey,
} from 'irene/utils/security-aeis';

import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';
import { type SecurityAnalysisExploitabilitySignal } from 'irene/models/security/analysis';

export interface SecurityValidatedFindingSignalRow {
  key: string;
  label: string;
  selected: SecurityAnalysisExploitabilitySignal;
}

// The finding scale is -1/1/2/3; the chip colours come off the risk scale.
const VALIDATED_FINDING_LIKELIHOOD_RISK: Record<number, number> = {
  3: ENUMS.RISK.HIGH,
  2: ENUMS.RISK.MEDIUM,
  1: ENUMS.RISK.LOW,
};

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
    areAllPanelsOpen: boolean;
    isPanelOpen: (panel: SecurityValidatedFindingPanelId) => boolean;
    onTogglePanel: (panel: SecurityValidatedFindingPanelId) => void;
    onToggleExpandAll: () => void;
    onSavePanel: (panel: SecurityValidatedFindingPanelId) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsFindingDetailComponent extends Component<SecurityAnalysisDetailsValidatedFindingsFindingDetailSignature> {
  @service declare intl: IntlService;

  // The record holds plain text, because the read-only KnoxIQ page renders
  // these fields escaped. The editors keep showing the html the reader typed,
  // so formatting does not vanish mid-edit.
  @tracked drafts: Record<string, string> = {};
  @tracked draftsFindingId: string | null = null;

  readonly panel = SECURITY_VALIDATED_FINDING_PANEL;

  // The API scores both on the same -1/1/2/3 scale, so the option values are
  // the integers it accepts and the labels are translated on render.
  readonly signalValues = SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES;
  readonly confidenceOptions: number[] = [...CONFIDENCE_VALUES];
  readonly likelihoodOptions: number[] = [...EXPLOITABILITY_LIKELIHOOD_VALUES];

  get finding() {
    return this.args.finding;
  }

  get evidenceHtml() {
    return this.editorValueFor('evidence', this.finding.evidenceHtml);
  }

  get reasoningHtml() {
    return this.editorValueFor('reasoning', this.finding.reasoning);
  }

  get displayScore(): string | number {
    const score = this.finding.exploitabilityScore;

    return score === null || score === undefined ? '—' : score.toFixed(1);
  }

  get scoreLabel() {
    return this.scaleLabel(this.finding.exploitabilityLikelihood);
  }

  get scoreRiskClass() {
    return riskClass([
      VALIDATED_FINDING_LIKELIHOOD_RISK[
        this.finding.exploitabilityLikelihood
      ] ?? ENUMS.RISK.UNKNOWN,
    ]);
  }

  get currentSignals() {
    return buildFullSignals(this.finding.exploitability?.signals);
  }

  get signalRows(): SecurityValidatedFindingSignalRow[] {
    const signals = this.currentSignals;

    return SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.map((key) => ({
      key,
      label: humanizeAeisSignalKey(key),
      selected: signals[key] as SecurityAnalysisExploitabilitySignal,
    }));
  }

  get remediationPrompt() {
    return this.finding.developerPrompt;
  }

  get exploitabilityAnalysisHtml() {
    return this.editorValueFor(
      'exploitabilityAnalysis',
      this.finding.exploitabilityAnalysis
    );
  }

  editorValueFor(field: string, savedValue: string) {
    return this.draftsFindingId === this.finding.id
      ? (this.drafts[field] ?? savedValue)
      : savedValue;
  }

  rememberEditorValue(field: string, value: string) {
    this.drafts =
      this.draftsFindingId === this.finding.id
        ? { ...this.drafts, [field]: value }
        : { [field]: value };

    this.draftsFindingId = this.finding.id;
  }

  updateValidation(edit: SecurityValidatedFindingValidationEdit) {
    this.finding.set(
      'validation',
      buildValidation(this.finding.validation, edit)
    );
  }

  updateExploitability(edit: SecurityValidatedFindingExploitabilityEdit) {
    this.finding.set(
      'exploitability',
      buildExploitability(this.finding.exploitability, edit)
    );
  }

  @action
  scaleLabel(value: number) {
    return this.intl.t(
      `securityAnalysisDetails.validatedFindings.scale.${value}`
    );
  }

  @action
  selectConfidence(confidence: number) {
    this.updateValidation({ confidence });
  }

  @action
  updateSummary(event: Event) {
    this.updateValidation({
      summary: (event.target as HTMLTextAreaElement).value,
    });
  }

  @action
  updateEvidence(evidence: string) {
    this.rememberEditorValue('evidence', evidence);
    this.updateValidation({ evidenceHtml: evidence });
  }

  @action
  updateReasoning(reasoning: string) {
    this.rememberEditorValue('reasoning', reasoning);
    this.updateValidation({ reasoning });
  }

  @action
  selectLikelihood(likelihood: number) {
    this.updateExploitability({ likelihood });
  }

  @action
  selectSignal(key: string, value: SecurityAnalysisExploitabilitySignal) {
    this.updateExploitability({
      signals: { ...this.currentSignals, [key]: value },
    });
  }

  @action
  signalOptionLabel(value: string | boolean) {
    return this.intl.t(`securityAnalysisDetails.aeis.signal.${String(value)}`);
  }

  @action
  updateScore(score: number) {
    this.updateExploitability({ score });
  }

  @action
  updateRemediationPrompt(event: Event) {
    this.finding.set(
      'developerPrompt',
      (event.target as HTMLTextAreaElement).value
    );
  }

  @action
  updateExploitabilityBody(body: string) {
    this.rememberEditorValue('exploitabilityAnalysis', body);
    this.updateExploitability({ analysis: body });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::FindingDetail': typeof SecurityAnalysisDetailsValidatedFindingsFindingDetailComponent;
  }
}
