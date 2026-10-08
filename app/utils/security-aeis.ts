import type {
  SecurityAnalysisAeisLikelihood,
  SecurityAnalysisAeisOverridePayload,
  SecurityAnalysisExploitabilitySignal,
} from 'irene/models/security/analysis';

/**
 * The seven exploitability vectors the override endpoint validates against.
 * An omitted key is normalized to 'unknown' server-side rather than left at
 * its previous value, so every write sends all seven.
 */
export const SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS = [
  'requires_chaining',
  'remote_exploitation',
  'public_exploit_exists',
  'local_exploitation_only',
  'minimal_user_interaction',
  'no_authentication_required',
  'obscure_or_environment_specific',
] as const;

export type SecurityAnalysisAeisSignalKey =
  (typeof SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS)[number];

export type SecurityAnalysisAeisSignals = Record<
  string,
  SecurityAnalysisExploitabilitySignal
>;

/** Fills in every missing vector so a partial write cannot blank the rest. */
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
 * The AEIS equivalent of the canonical passed CVSS vector: the hardest shape
 * to exploit, rather than a bare zero. The backend has no concept of "mark as
 * passed", so the dashboard mirrors the CVSS save with this override.
 */
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

/** Builds the nested path used by both the override PUT and DELETE. */
export function aeisOverrideUrl(analysisId: string | number | undefined) {
  return ['analyses', analysisId, 'aeis-override'].join('/');
}

export function isAeisLikelihood(
  value: string
): value is SecurityAnalysisAeisLikelihood {
  return ['low', 'medium', 'high', 'critical'].includes(value);
}
