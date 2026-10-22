import Model, { attr } from '@ember-data/model';

import {
  evidenceToHtml,
  toValidatedFindingContent,
  type SecurityValidatedFindingStep,
} from 'irene/utils/knoxiq-validated-findings';

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
  steps?: (string | SecurityValidatedFindingStep)[];
  code_examples?: string[];
  references?: string[] | null;
  source?: SecurityValidatedFindingSource | null;
}

export interface SecurityValidatedFindingVerificationStep {
  step_number: number;
  id?: number;
  title: string;
  command?: string;
  expected_result: string;
}

export interface SecurityValidatedFindingPoc {
  poc_title: string;
  verification_steps: SecurityValidatedFindingVerificationStep[];
  expected_evidence: string[];
  source?: SecurityValidatedFindingSource | null;
}

export interface SecurityValidatedFindingExploitability {
  score: number | null;
  exploitability_likelihood: string;
  signals: Record<string, boolean | 'unknown'>;
  signal_reasoning: Record<string, string>;
  attack_scenario: string[];
  references: string[];
  ai_model_used: string;
  ai_fallback_used: boolean;

  exploitability_analysis: {
    summary: string;
    evidence: string[];
  };
}

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
    return toValidatedFindingContent(this);
  }

  get confidence() {
    return this.content.confidence;
  }

  get summary() {
    return this.content.summary;
  }

  get evidenceHtml() {
    return evidenceToHtml(this.content.evidence);
  }

  get reasoning() {
    return this.content.reasoning;
  }

  get remediationSteps() {
    return this.content.remediationSteps;
  }

  get stepsToReproduce() {
    return this.content.stepsToReproduce;
  }

  get exploitabilityLikelihood() {
    return this.content.exploitabilityLikelihood;
  }

  get exploitabilityAnalysis() {
    return this.content.exploitabilityAnalysis;
  }

  get exploitabilityScore() {
    return this.content.exploitabilityScore;
  }

  get exploitabilityEvidence() {
    return this.content.exploitabilityEvidence;
  }

  get attackScenario() {
    return this.content.attackScenario;
  }

  get remediationSummary() {
    return this.content.remediationSummary;
  }

  get expectedEvidence() {
    return this.content.expectedEvidence;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'security/validated-finding': SecurityValidatedFindingModel;
  }
}
