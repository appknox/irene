import type { ValidatedFinding } from 'irene/components/security/analysis-details/validated-findings';

export interface KnoxiqFindingApiResponse {
  id: number;
  finding_id: string;
  title: string;
  description: string;
  validation?: {
    confidence_label?: string;
    finding_summary?: string;
    evidence?: string[];
    reasoning?: string;
  } | null;
  remediation?: {
    steps?: string[];
  } | null;
  poc?: {
    verification_steps?: { title?: string; expected_result?: string }[];
  } | null;
  exploitability?: {
    exploitability_likelihood?: string;
    exploitability_analysis?: { summary?: string } | null;
  } | null;
}

// Inverse of the backend's _CONFIDENCE_LABELS / _EXPLOITABILITY_LIKELIHOOD_LABELS
// in mycroft/knoxiq/serializers.py - the security dashboard finding editor's
// own -1/1/2/3 scale, unrelated to the AEIS override's ExploitabilityEnum.
// Critical folds into High: the editor only offers four options, same
// "no Critical tier" call made for AEIS elsewhere.
const CONFIDENCE_LABEL_TO_VALUE: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  UNKNOWN: -1,
};

const EXPLOITABILITY_LABEL_TO_VALUE: Record<string, number> = {
  Critical: 3,
  High: 3,
  Medium: 2,
  Low: 1,
  Unknown: -1,
};

/**
 * remediation.steps is a flat list[str] in the KnoxIQ result schema (no
 * heading), unlike poc.verification_steps which has a real title. Rather
 * than guess a heading/body split out of a plain string, remediation steps
 * always load with an empty heading - a heading typed in and saved here
 * gets folded into the body text on save (see the backend's
 * _merge_remediation), so it won't reappear as a separate field on reload.
 */
export function fromKnoxiqFindingResponse(
  finding: KnoxiqFindingApiResponse
): ValidatedFinding {
  return {
    id: String(finding.id),
    title: finding.title,
    description: finding.description,
    confidence:
      CONFIDENCE_LABEL_TO_VALUE[finding.validation?.confidence_label ?? ''] ??
      -1,
    summary: finding.validation?.finding_summary ?? '',
    evidence: finding.validation?.evidence ?? [],
    reasoning: finding.validation?.reasoning ?? '',
    remediation_steps: (finding.remediation?.steps ?? []).map((body) => ({
      heading: '',
      body,
    })),
    steps_to_reproduce: (finding.poc?.verification_steps ?? []).map((step) => ({
      heading: step.title ?? '',
      body: step.expected_result ?? '',
    })),
    exploitability_likelihood:
      EXPLOITABILITY_LABEL_TO_VALUE[
        finding.exploitability?.exploitability_likelihood ?? ''
      ] ?? -1,
    exploitability_analysis:
      finding.exploitability?.exploitability_analysis?.summary ?? '',
  };
}
