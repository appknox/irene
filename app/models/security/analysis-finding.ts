import Model, { attr } from '@ember-data/model';

export const SECURITY_ANALYSIS_FINDING_CONFIDENCE = [
  'High',
  'Medium',
  'Low',
] as const;

export const SECURITY_ANALYSIS_FINDING_LIKELIHOOD = [
  'High',
  'Medium',
  'Low',
] as const;

export type SecurityAnalysisFindingConfidence =
  (typeof SECURITY_ANALYSIS_FINDING_CONFIDENCE)[number];

export type SecurityAnalysisFindingLikelihood =
  (typeof SECURITY_ANALYSIS_FINDING_LIKELIHOOD)[number];

/**
 * A single ordered step inside remediation or steps-to-reproduce. `body` holds
 * editor html rather than plain text, so it round-trips through tiptap intact.
 */
export interface SecurityAnalysisFindingStep {
  step_number: number;
  heading: string;
  body: string;
}

export interface SecurityAnalysisFindingValidation {
  confidence_label: SecurityAnalysisFindingConfidence | '';
  finding_summary: string;
  evidence: string;
  reasoning: string;
}

export interface SecurityAnalysisFindingRemediation {
  steps: SecurityAnalysisFindingStep[];
}

export interface SecurityAnalysisFindingPoc {
  steps: SecurityAnalysisFindingStep[];
}

export interface SecurityAnalysisFindingExploitability {
  exploitability_likelihood: SecurityAnalysisFindingLikelihood | '';
  exploitability_analysis: { body: string };
}

export default class SecurityAnalysisFindingModel extends Model {
  @attr()
  declare validation: SecurityAnalysisFindingValidation;

  @attr()
  declare remediation: SecurityAnalysisFindingRemediation;

  @attr()
  declare poc: SecurityAnalysisFindingPoc;

  @attr()
  declare exploitability: SecurityAnalysisFindingExploitability;

  get confidenceLabel() {
    return this.validation?.confidence_label ?? '';
  }

  get summary() {
    return this.validation?.finding_summary ?? '';
  }

  get remediationSteps() {
    return this.remediation?.steps ?? [];
  }

  get reproductionSteps() {
    return this.poc?.steps ?? [];
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'security/analysis-finding': SecurityAnalysisFindingModel;
  }
}
