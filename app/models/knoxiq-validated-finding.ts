import Model, { attr } from '@ember-data/model';

export interface KnoxiqValidatedFindingSource {
  source_type: string;
  kb_id: string | null;
  llm_model: string | null;
  confidence: number | null;
}

export interface KnoxiqValidatedFindingValidation {
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

export interface KnoxiqValidatedFindingRemediation {
  remediation: string;
  steps: string[];
  code_examples: string[];
  references: string[] | null;
  source: KnoxiqValidatedFindingSource | null;
}

export interface KnoxiqValidatedFindingVerificationStep {
  step_number: number;
  title: string;
  command: string;
  expected_result: string;
}

export interface KnoxiqValidatedFindingPoc {
  poc_title: string;
  verification_steps: KnoxiqValidatedFindingVerificationStep[];
  expected_evidence: string[];
  source: KnoxiqValidatedFindingSource | null;
}

export interface KnoxiqValidatedFindingExploitability {
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

export default class KnoxiqValidatedFindingModel extends Model {
  @attr('string')
  declare title: string;

  @attr('string')
  declare description: string;

  @attr()
  declare validation: KnoxiqValidatedFindingValidation;

  @attr()
  declare remediation: KnoxiqValidatedFindingRemediation;

  @attr()
  declare poc: KnoxiqValidatedFindingPoc;

  @attr('string')
  declare developerPrompt: string;

  @attr()
  declare exploitability: KnoxiqValidatedFindingExploitability;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'knoxiq-validated-finding': KnoxiqValidatedFindingModel;
  }
}
