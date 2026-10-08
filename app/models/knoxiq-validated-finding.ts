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

export interface KnoxiqValidatedFindingApiRequest {
  method: string | null;
  url: string | null;
  headers: Record<string, string> | null;
  body: unknown;
  params: Record<string, unknown> | null;
  cookies: Record<string, unknown> | null;
}

export interface KnoxiqValidatedFindingApiResponse {
  status_code: number | null;
  headers: Record<string, string> | null;
  text: string | null;
  reason: string | null;
  url: string | null;
  error: string | null;
}

export interface KnoxiqValidatedFindingRequestResponsePair {
  label: string;
  request: KnoxiqValidatedFindingApiRequest | null;
  response: KnoxiqValidatedFindingApiResponse | null;
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

  // API-scan findings only: every live request/response the validation
  // agent actually sent while investigating (captured replay, mutation
  // probes, JWT-none controls, ...). null for SAST/DAST findings.
  @attr()
  declare requestResponsePairs:
    | KnoxiqValidatedFindingRequestResponsePair[]
    | null;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'knoxiq-validated-finding': KnoxiqValidatedFindingModel;
  }
}
