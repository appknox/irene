/**
 * Single source of truth for:
 *   1. Mapping CVSS enum abbreviations → display labels (version-safe)
 *   2. Default metric shapes
 *   3. Declarative per-metric definitions (key, label, options, enumGroup)
 *
 * WHY THIS EXISTS
 * ───────────────
 * The five previous helpers (metricImpact, metricVector, metricInteraction,
 * metricRequirements, metricScope) used a flat `switch` on raw abbreviation
 * values ('N', 'L', 'H' …). Because many abbreviations collide across v3 and
 * v4 (e.g. CVSS_V3_USER_INTERACTION.NOT_REQUIRED === 'N' and
 * CVSS_V4_USER_INTERACTION.NONE === 'N'), the switch silently returned the
 * wrong label depending on which case matched first.
 *
 * This module fixes that by inverting each enum group into its own value→label
 * Map. `getMetricLabel(enumGroup, value)` is always called with the *specific*
 * enum group for that metric — version context is explicit, collisions are
 * impossible.
 */

import ENUMS from 'irene/enums';

import type {
  CvssV3Metrics,
  CvssV4Metrics,
} from 'irene/models/security/analysis';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The shape of any ENUMS group — a plain object whose primitive values are
 * the abbreviation strings/numbers stored in CVSS metrics fields.
 */
export type CvssMetricOptionData = string | number;
export type CvssEnumGroup = Record<string, unknown>;
export type CvssV4MetricKey = keyof CvssV4Metrics;
export type CvssV3MetricKey = keyof CvssV3Metrics;

/** A single metric row definition — everything a select row needs. */
export interface CvssMetricDefinition<TMetricKey extends string> {
  metricTranslationKey: string;
  key: TMetricKey;
  enumGroup: CvssEnumGroup;
  options: (string | number)[];
}

// ─── Label map cache ─────────────────────────────────────────────────────────

/** Lazily-built cache so each enum group is only inverted once per session. */
const labelMapCache = new WeakMap<
  CvssEnumGroup,
  Map<string | number, string>
>();

/**
 * Inverts an enum group into a value→label Map, skipping non-primitive values
 * (e.g. nested arrays like BASE_VALUES / VALUES).
 *
 * Given:  { NOT_REQUIRED: 'N', REQUIRED: 'R' }
 * Returns: Map { 'N' → 'NOT REQUIRED', 'R' → 'REQUIRED' }
 */
function buildLabelMap(enumGroup: CvssEnumGroup): Map<string | number, string> {
  const map = new Map<string | number, string>();

  for (const [key, value] of Object.entries(enumGroup)) {
    if (typeof value !== 'string' && typeof value !== 'number') {
      continue;
    }

    map.set(value, key.replace(/_/g, ' '));
  }

  return map;
}

function getLabelMap(enumGroup: CvssEnumGroup): Map<string | number, string> {
  if (!labelMapCache.has(enumGroup)) {
    labelMapCache.set(enumGroup, buildLabelMap(enumGroup));
  }

  return labelMapCache.get(enumGroup)!;
}

// ─── Public API: label lookup ─────────────────────────────────────────────────

/**
 * Returns the display label for a CVSS metric value within a specific enum
 * group. Falls back to the raw value (stringified) if no match is found.
 *
 * @example
 * getMetricLabel(ENUMS.CVSS_V4_USER_INTERACTION, 'N') // → 'NONE'
 * getMetricLabel(ENUMS.CVSS_V3_USER_INTERACTION, 'N') // → 'NOT REQUIRED'
 */
export function getMetricLabel(
  enumGroup: CvssEnumGroup,
  value: CvssMetricOptionData
): string {
  return getLabelMap(enumGroup).get(value) ?? String(value);
}

// ─── Default metric shapes ────────────────────────────────────────────────────

export const DEFAULT_CVSS_V4_METRICS: CvssV4Metrics = {
  attack_vector: ENUMS.CVSS_V4_ATTACK_VECTOR.UNKNOWN,
  attack_complexity: ENUMS.CVSS_V4_ATTACK_COMPLEXITY.UNKNOWN,
  attack_requirements: ENUMS.CVSS_V4_ATTACK_REQUIREMENTS.UNKNOWN,
  privileges_required: ENUMS.CVSS_V4_PRIVILEGES_REQUIRED.UNKNOWN,
  user_interaction: ENUMS.CVSS_V4_USER_INTERACTION.UNKNOWN,
  vuln_confidentiality: ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT.UNKNOWN,
  vuln_integrity: ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT.UNKNOWN,
  vuln_availability: ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT.UNKNOWN,
  subsequent_integrity: ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT.UNKNOWN,
  subsequent_confidentiality:
    ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT.UNKNOWN,
  subsequent_availability: ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT.UNKNOWN,
};

export const DEFAULT_CVSS_V3_METRICS: CvssV3Metrics = {
  attack_vector: ENUMS.CVSS_V3_ATTACK_VECTOR.UNKNOWN,
  attack_complexity: ENUMS.CVSS_V3_ATTACK_COMPLEXITY.UNKNOWN,
  privileges_required: ENUMS.CVSS_V3_PRIVILEGES_REQUIRED.UNKNOWN,
  user_interaction: ENUMS.CVSS_V3_USER_INTERACTION.UNKNOWN,
  scope: ENUMS.CVSS_V3_SCOPE.UNKNOWN,
  confidentiality_impact: ENUMS.CVSS_V3_CONFIDENTIALITY_IMPACT.UNKNOWN,
  integrity_impact: ENUMS.CVSS_V3_INTEGRITY_IMPACT.UNKNOWN,
  availability_impact: ENUMS.CVSS_V3_AVAILABILITY_IMPACT.UNKNOWN,
};

// ─── Passed metrics shapes ────────────────────────────────────────────────────

export const PASSED_CVSS_V4_METRICS: CvssV4Metrics = {
  attack_vector: ENUMS.CVSS_V4_ATTACK_VECTOR.NETWORK,
  attack_complexity: ENUMS.CVSS_V4_ATTACK_COMPLEXITY.LOW,
  attack_requirements: ENUMS.CVSS_V4_ATTACK_REQUIREMENTS.NONE,
  privileges_required: ENUMS.CVSS_V4_PRIVILEGES_REQUIRED.NONE,
  user_interaction: ENUMS.CVSS_V4_USER_INTERACTION.NONE,
  vuln_confidentiality: ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT.NONE,
  vuln_integrity: ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT.NONE,
  vuln_availability: ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT.NONE,
  subsequent_confidentiality:
    ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT.NONE,
  subsequent_integrity: ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT.NONE,
  subsequent_availability: ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT.NONE,
};

export const PASSED_CVSS_V3_METRICS: CvssV3Metrics = {
  attack_vector: ENUMS.CVSS_V3_ATTACK_VECTOR.PHYSICAL,
  attack_complexity: ENUMS.CVSS_V3_ATTACK_COMPLEXITY.LOW,
  privileges_required: ENUMS.CVSS_V3_PRIVILEGES_REQUIRED.HIGH,
  user_interaction: ENUMS.CVSS_V3_USER_INTERACTION.REQUIRED,
  scope: ENUMS.CVSS_V3_SCOPE.UNCHANGED,
  confidentiality_impact: ENUMS.CVSS_V3_CONFIDENTIALITY_IMPACT.NONE,
  integrity_impact: ENUMS.CVSS_V3_INTEGRITY_IMPACT.NONE,
  availability_impact: ENUMS.CVSS_V3_AVAILABILITY_IMPACT.NONE,
};

// ─── Metric definitions ───────────────────────────────────────────────────────

/**
 * Declarative definition of every v4 metric select row.
 *
 * `enumGroup` is the specific ENUMS object for this metric. Passing it here
 * means `getMetricLabel` always receives unambiguous version context —
 * no cross-version abbreviation collisions are possible.
 */
export const CVSS_V4_METRIC_DEFINITIONS: CvssMetricDefinition<CvssV4MetricKey>[] =
  [
    {
      key: 'attack_vector',
      metricTranslationKey: 'cvssVectorMetrics.attackVector',
      enumGroup: ENUMS.CVSS_V4_ATTACK_VECTOR,
      options: ENUMS.CVSS_V4_ATTACK_VECTOR.VALUES,
    },
    {
      key: 'attack_complexity',
      metricTranslationKey: 'cvssVectorMetrics.attackComplexity',
      enumGroup: ENUMS.CVSS_V4_ATTACK_COMPLEXITY,
      options: ENUMS.CVSS_V4_ATTACK_COMPLEXITY.VALUES,
    },
    {
      key: 'attack_requirements',
      metricTranslationKey: 'cvssVectorMetrics.attackRequirements',
      enumGroup: ENUMS.CVSS_V4_ATTACK_REQUIREMENTS,
      options: ENUMS.CVSS_V4_ATTACK_REQUIREMENTS.VALUES,
    },
    {
      key: 'privileges_required',
      metricTranslationKey: 'cvssVectorMetrics.privilegesRequired',
      enumGroup: ENUMS.CVSS_V4_PRIVILEGES_REQUIRED,
      options: ENUMS.CVSS_V4_PRIVILEGES_REQUIRED.VALUES,
    },
    {
      key: 'user_interaction',
      metricTranslationKey: 'cvssVectorMetrics.userInteraction',
      enumGroup: ENUMS.CVSS_V4_USER_INTERACTION,
      options: ENUMS.CVSS_V4_USER_INTERACTION.VALUES,
    },
    {
      key: 'vuln_confidentiality',
      metricTranslationKey: 'cvssVectorMetrics.vulnerableConfidentialityImpact',
      enumGroup: ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT,
      options: ENUMS.CVSS_V4_VULN_CONFIDENTIALITY_IMPACT.VALUES,
    },
    {
      key: 'vuln_integrity',
      metricTranslationKey: 'cvssVectorMetrics.vulnerableIntegrityImpact',
      enumGroup: ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT,
      options: ENUMS.CVSS_V4_VULN_INTEGRITY_IMPACT.VALUES,
    },
    {
      key: 'vuln_availability',
      metricTranslationKey: 'cvssVectorMetrics.vulnerableAvailabilityImpact',
      enumGroup: ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT,
      options: ENUMS.CVSS_V4_VULN_AVAILABILITY_IMPACT.VALUES,
    },
    {
      key: 'subsequent_confidentiality',
      metricTranslationKey: 'cvssVectorMetrics.subsequentConfidentialityImpact',
      enumGroup: ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT,
      options: ENUMS.CVSS_V4_SUBSEQUENT_CONFIDENTIALITY_IMPACT.VALUES,
    },
    {
      key: 'subsequent_integrity',
      metricTranslationKey: 'cvssVectorMetrics.subsequentIntegrityImpact',
      enumGroup: ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT,
      options: ENUMS.CVSS_V4_SUBSEQUENT_INTEGRITY_IMPACT.VALUES,
    },
    {
      key: 'subsequent_availability',
      metricTranslationKey: 'cvssVectorMetrics.subsequentAvailabilityImpact',
      enumGroup: ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT,
      options: ENUMS.CVSS_V4_SUBSEQUENT_AVAILABILITY_IMPACT.VALUES,
    },
  ];

export const CVSS_V3_METRIC_DEFINITIONS: CvssMetricDefinition<CvssV3MetricKey>[] =
  [
    {
      key: 'attack_vector',
      metricTranslationKey: 'cvssVectorMetrics.attackVector',
      enumGroup: ENUMS.CVSS_V3_ATTACK_VECTOR,
      options: ENUMS.CVSS_V3_ATTACK_VECTOR.VALUES,
    },
    {
      key: 'attack_complexity',
      metricTranslationKey: 'cvssVectorMetrics.attackComplexity',
      enumGroup: ENUMS.CVSS_V3_ATTACK_COMPLEXITY,
      options: ENUMS.CVSS_V3_ATTACK_COMPLEXITY.VALUES,
    },
    {
      key: 'privileges_required',
      metricTranslationKey: 'cvssVectorMetrics.privilegesRequired',
      enumGroup: ENUMS.CVSS_V3_PRIVILEGES_REQUIRED,
      options: ENUMS.CVSS_V3_PRIVILEGES_REQUIRED.VALUES,
    },
    {
      key: 'user_interaction',
      metricTranslationKey: 'cvssVectorMetrics.userInteraction',
      enumGroup: ENUMS.CVSS_V3_USER_INTERACTION,
      options: ENUMS.CVSS_V3_USER_INTERACTION.VALUES,
    },
    {
      key: 'scope',
      metricTranslationKey: 'cvssVectorMetrics.scope',
      enumGroup: ENUMS.CVSS_V3_SCOPE,
      options: ENUMS.CVSS_V3_SCOPE.VALUES,
    },
    {
      key: 'confidentiality_impact',
      metricTranslationKey: 'cvssVectorMetrics.confidentialityImpact',
      enumGroup: ENUMS.CVSS_V3_CONFIDENTIALITY_IMPACT,
      options: ENUMS.CVSS_V3_CONFIDENTIALITY_IMPACT.VALUES,
    },
    {
      key: 'integrity_impact',
      metricTranslationKey: 'cvssVectorMetrics.integrityImpact',
      enumGroup: ENUMS.CVSS_V3_INTEGRITY_IMPACT,
      options: ENUMS.CVSS_V3_INTEGRITY_IMPACT.VALUES,
    },
    {
      key: 'availability_impact',
      metricTranslationKey: 'cvssVectorMetrics.availabilityImpact',
      enumGroup: ENUMS.CVSS_V3_AVAILABILITY_IMPACT,
      options: ENUMS.CVSS_V3_AVAILABILITY_IMPACT.VALUES,
    },
  ];
