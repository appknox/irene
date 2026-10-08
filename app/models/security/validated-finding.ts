import Model, { attr } from '@ember-data/model';

import {
  CONFIDENCE_LABELS,
  EXPLOITABILITY_LIKELIHOOD_LABELS,
  UNKNOWN_SCALE_VALUE,
  evidenceFromHtml,
  evidenceToHtml,
  fromKnoxiqFindingResponse,
  type ManualFindingStep,
} from 'irene/utils/manual-validated-findings';

export interface SecurityValidatedFindingSource {
  source_type: string;
  kb_id: string | null;
  llm_model: string | null;
  confidence: number | null;
}

export interface SecurityValidatedFindingValidation {
  verdict: string;
  is_valid: boolean;
  confidence: number;
  confidence_label: string;
  finding_summary: string;
  evidence: string[];
  reasoning: string;
  false_positive_indicators: string[];
  is_third_party: boolean;
  library_origin: string | null;
}

export interface SecurityValidatedFindingRemediation {
  remediation: string;
  // Plain strings from the AI result; {heading, body} once a human has saved
  // the remediation panel.
  steps: (string | ManualFindingStep)[];
  code_examples: string[];
  references: string[] | null;
  source: SecurityValidatedFindingSource | null;
}

export interface SecurityValidatedFindingVerificationStep {
  step_number: number;
  /** Client-only, mirrored from ManualFindingStep so a reorder keeps identity. */
  id?: number;
  title: string;
  command: string;
  expected_result: string;
}

export interface SecurityValidatedFindingPoc {
  poc_title: string;
  verification_steps: SecurityValidatedFindingVerificationStep[];
  expected_evidence: string[];
  source: SecurityValidatedFindingSource | null;
}

export interface SecurityValidatedFindingExploitability {
  score: number;
  exploitability_likelihood: string;
  signals: Record<string, boolean>;
  signal_reasoning: Record<string, string>;
  exploitability_analysis: {
    summary: string;
    evidence: string[];
  };
  attack_scenario: string[];
  references: string[];
  ai_model_used: string;
  ai_fallback_used: boolean;
}

/**
 * A KnoxIQ finding as the security dashboard edits it. The API reads nested
 * and writes flat, so the attributes below hold the nested response and the
 * accessors expose the one flat shape the editor binds to.
 */
export default class SecurityValidatedFindingModel extends Model {
  @attr('string')
  declare findingId: string;

  @attr('number')
  declare scanType: number;

  @attr('number')
  declare scanId: number;

  @attr('string')
  declare title: string;

  @attr('string')
  declare description: string;

  @attr()
  declare validation: SecurityValidatedFindingValidation;

  @attr()
  declare remediation: SecurityValidatedFindingRemediation;

  @attr()
  declare poc: SecurityValidatedFindingPoc;

  @attr('string')
  declare developerPrompt: string;

  @attr()
  declare exploitability: SecurityValidatedFindingExploitability;

  get content() {
    return fromKnoxiqFindingResponse(this);
  }

  get confidence() {
    return this.content.confidence;
  }

  set confidence(value: number) {
    this.validation = {
      ...this.validation,
      confidence_label:
        CONFIDENCE_LABELS[value] ??
        (CONFIDENCE_LABELS[UNKNOWN_SCALE_VALUE] as string),
    };
  }

  get summary() {
    return this.content.summary;
  }

  set summary(value: string) {
    this.validation = { ...this.validation, finding_summary: value };
  }

  get evidenceHtml() {
    return evidenceToHtml(this.content.evidence);
  }

  set evidenceHtml(value: string) {
    this.validation = { ...this.validation, evidence: evidenceFromHtml(value) };
  }

  get reasoning() {
    return this.content.reasoning;
  }

  set reasoning(value: string) {
    this.validation = { ...this.validation, reasoning: value };
  }

  get remediationSteps() {
    return this.content.remediationSteps;
  }

  set remediationSteps(steps: ManualFindingStep[]) {
    this.remediation = { ...this.remediation, steps };
  }

  get stepsToReproduce() {
    return this.content.stepsToReproduce;
  }

  set stepsToReproduce(steps: ManualFindingStep[]) {
    this.poc = {
      ...this.poc,
      verification_steps: steps.map((step, index) => ({
        step_number: index + 1,
        id: step.id,
        title: step.heading,
        // The API hardcodes command to '' on every write, so nothing is
        // gained by sending one back.
        command: '',
        expected_result: step.body,
      })),
    };
  }

  get exploitabilityLikelihood() {
    return this.content.exploitabilityLikelihood;
  }

  set exploitabilityLikelihood(value: number) {
    this.exploitability = {
      ...this.exploitability,
      exploitability_likelihood:
        EXPLOITABILITY_LIKELIHOOD_LABELS[value] ??
        (EXPLOITABILITY_LIKELIHOOD_LABELS[UNKNOWN_SCALE_VALUE] as string),
    };
  }

  get exploitabilityAnalysis() {
    return this.content.exploitabilityAnalysis;
  }

  set exploitabilityAnalysis(summary: string) {
    this.exploitability = {
      ...this.exploitability,
      exploitability_analysis: {
        ...this.exploitability?.exploitability_analysis,
        summary,
        evidence: this.exploitability?.exploitability_analysis?.evidence ?? [],
      },
    };
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'security/validated-finding': SecurityValidatedFindingModel;
  }
}
