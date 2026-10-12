import ENUMS from 'irene/enums';

import type { SecurityAnalysisExploitabilitySignal } from 'irene/models/security/analysis';

export type SecurityAnalysisAeisSignals = Record<
  string,
  SecurityAnalysisExploitabilitySignal
>;

export type SecurityAnalysisAeisLikelihood =
  (typeof SECURITY_ANALYSIS_AEIS_LIKELIHOODS)[number];

// Request body for PUT /api/v2/analyses/:id/aeis-override.
export interface SecurityAnalysisAeisOverridePayload {
  score: number;
  likelihood: SecurityAnalysisAeisLikelihood;
  signals?: SecurityAnalysisAeisSignals;
}

export const SECURITY_ANALYSIS_AEIS_LIKELIHOODS = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

// The tri-state each vector can hold.
export const SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES: SecurityAnalysisExploitabilitySignal[] =
  ['unknown', true, false];

// An omitted vector is normalized to 'unknown', so every write sends all seven.
export const SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS = [
  'requires_chaining',
  'remote_exploitation',
  'public_exploit_exists',
  'local_exploitation_only',
  'minimal_user_interaction',
  'no_authentication_required',
  'obscure_or_environment_specific',
] as const;

// The backend has no "mark as passed", so the dashboard mirrors it here.
export const SECURITY_ANALYSIS_AEIS_PASSED_OVERRIDE: SecurityAnalysisAeisOverridePayload =
  {
    score: 0,
    likelihood: 'low',
    signals: {
      requires_chaining: true,
      remote_exploitation: false,
      public_exploit_exists: false,
      local_exploitation_only: true,
      minimal_user_interaction: false,
      no_authentication_required: false,
      obscure_or_environment_specific: true,
    },
  };

/**
 * Narrows a stored likelihood to one the override endpoint accepts.
 *
 * @param value A likelihood from the record, in any casing.
 * @returns True when the endpoint would accept it.
 */
const AEIS_LIKELIHOOD_RISK: Record<string, number> = {
  critical: ENUMS.RISK.CRITICAL,
  high: ENUMS.RISK.HIGH,
  medium: ENUMS.RISK.MEDIUM,
  low: ENUMS.RISK.LOW,
};

/**
 * Fills in every missing vector so a partial write cannot blank the rest.
 *
 * @param signals The vectors currently known, if any.
 * @returns All seven vectors, unknown where none was given.
 */
export function buildFullSignals(
  signals?: SecurityAnalysisAeisSignals | null
): SecurityAnalysisAeisSignals {
  return Object.fromEntries(
    SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.map((key) => [
      key,
      signals?.[key] ?? 'unknown',
    ])
  );
}

/**
 * Builds the override path, which is nested under its analysis.
 *
 * @param analysisId The analysis the override belongs to.
 * @returns The path, relative to the v2 namespace.
 */
export function aeisOverrideUrl(analysisId: string | number | undefined) {
  return ['analyses', analysisId, 'aeis-override'].join('/');
}

/**
 * Maps a stored likelihood onto the risk scale the risk tag and colours use.
 *
 * @param likelihood A likelihood from the record, in any casing.
 * @returns The matching risk, or unknown when there is none.
 */
export function aeisRiskForLikelihood(likelihood?: string | null) {
  return (
    AEIS_LIKELIHOOD_RISK[likelihood?.toLowerCase() ?? ''] ?? ENUMS.RISK.UNKNOWN
  );
}

export function isAeisLikelihood(
  value: string
): value is SecurityAnalysisAeisLikelihood {
  return SECURITY_ANALYSIS_AEIS_LIKELIHOODS.includes(
    value as SecurityAnalysisAeisLikelihood
  );
}
