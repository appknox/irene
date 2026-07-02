import { tracked } from '@glimmer/tracking';

import ENUMS from 'irene/enums';
import { riskClass, type RiskLabelClass } from 'irene/helpers/risk-class';

import {
  DEFAULT_CVSS_V4_METRICS,
  DEFAULT_CVSS_V3_METRICS,
  CVSS_V4_METRIC_DEFINITIONS,
  CVSS_V3_METRIC_DEFINITIONS,
} from 'irene/utils/cvss-metrics';

import type {
  CvssV3Metrics,
  CvssV4Metrics,
} from 'irene/models/security/analysis';

// ─── Shared types ─────────────────────────────────────────────────────────────

type CvssMetricValidation<TMetricKey extends string> = [
  TMetricKey,
  (string | number)[],
][];

export type CVSSCalculateAPIResponse = {
  cvss_base: number;
  risk: number;
};

export type CvssVersionDetails<TMetrics> = {
  version: number;
  base: number;
  risk: number;
  vector: string;
  metrics: TMetrics;
  isInValidCvssBase: boolean;
  riskLabelClass: RiskLabelClass;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts a typed CVSS metrics object into a plain Record for serialisation.
 * Pure utility — no side effects, no class coupling.
 */
export function computeCVSSMetrics<T extends CvssV4Metrics | CvssV3Metrics>(
  metrics: T
): Record<keyof T, string | number> {
  return Object.keys(metrics).reduce(
    (acc, key) => {
      const k = key as keyof T;
      acc[k] = metrics[k] as string | number;
      return acc;
    },
    {} as Record<keyof T, string | number>
  );
}

// ─── Abstract base ────────────────────────────────────────────────────────────

/**
 * Holds all reactive state and shared derived logic for one CVSS version.
 *
 * Subclasses supply the three things that actually differ between versions:
 *   1. `defaultMetrics`  — the fully-UNKNOWN initial metric shape
 *   2. `metricValidations` — the per-metric list of accepted BASE_VALUES
 *   3. `buildVector()`   — the version-specific vector string format
 *
 * Everything else — score tracking, `isEmpty`, `isValid`, `applyScore`,
 * `riskLabelClass`, `details` — is implemented here once and inherited.
 */
abstract class CvssVersionState<
  TMetrics extends { [K in keyof TMetrics]: string | number },
  TMetricKey extends keyof TMetrics & string = keyof TMetrics & string,
> {
  // Each subclass must declare the @tracked metrics property itself so that
  // Glimmer's decorator can attach to the concrete class's prototype.
  // (Decorators on abstract class fields aren't reliably supported in all
  //  TypeScript + decorator-transform combinations used in Ember projects.)
  abstract metrics: TMetrics;

  @tracked base = -1.0;
  @tracked risk: number = ENUMS.RISK.UNKNOWN;
  @tracked vector = '';
  @tracked isInvalidBase = false;

  /** The version number surfaced in `details` (e.g. 3 or 4). */
  protected abstract readonly version: number;

  /**
   * Pairs of [metricKey, acceptedValues] used for both `isEmpty` and
   * `isValid`. The UNKNOWN value for each metric must NOT appear in
   * `acceptedValues` — that distinction is what separates the two checks.
   */
  protected abstract readonly metricValidations: CvssMetricValidation<TMetricKey>;

  /**
   * The UNKNOWN sentinel for each metric key. Used by `isEmpty` to detect an
   * untouched vector without requiring subclasses to re-implement the check.
   */
  protected abstract readonly unknownValues: Record<
    TMetricKey,
    string | number
  >;

  // ─── Derived state ──────────────────────────────────────────────────────────

  get isEmpty(): boolean {
    return (Object.keys(this.unknownValues) as TMetricKey[]).every(
      (key) => this.metrics[key] === this.unknownValues[key]
    );
  }

  get isValid(): boolean {
    const allMetricsValid = this.metricValidations.every(
      ([metric, validValues]) =>
        validValues.includes(this.metrics[metric] as string | number)
    );

    return this.isEmpty || allMetricsValid;
  }

  get riskLabelClass() {
    return riskClass([this.risk]);
  }

  get details(): CvssVersionDetails<TMetrics> {
    return {
      version: this.version,
      base: this.base,
      risk: this.risk,
      vector: this.vector,
      metrics: this.metrics,
      isInValidCvssBase: this.isInvalidBase,
      riskLabelClass: this.riskLabelClass as RiskLabelClass,
    };
  }

  // ─── Mutations ──────────────────────────────────────────────────────────────

  /** Merges incoming metrics into the current tracked state. */
  applyMetrics(incoming: Partial<TMetrics>): void {
    // Full object replacement is required to trigger Glimmer's tracked setter.
    this.metrics = { ...this.metrics, ...incoming };
  }

  /** Applies a scored API response and clears any invalid-base flag. */
  applyScore(data: CVSSCalculateAPIResponse, vector: string): void {
    this.base = data.cvss_base;
    this.risk = data.risk;
    this.vector = vector;
    this.isInvalidBase = false;
  }

  /** Builds the version-specific CVSS vector string from current metrics. */
  abstract buildVector(): string;
}

// ─── CvssV4VersionState ───────────────────────────────────────────────────────

type V4MetricKey = keyof CvssV4Metrics & string;

export class CvssV4VersionState extends CvssVersionState<
  CvssV4Metrics,
  V4MetricKey
> {
  @tracked metrics: CvssV4Metrics = { ...DEFAULT_CVSS_V4_METRICS };

  protected readonly version = 4;

  protected readonly unknownValues: Record<V4MetricKey, string | number> =
    DEFAULT_CVSS_V4_METRICS;

  protected readonly metricValidations: CvssMetricValidation<V4MetricKey> =
    CVSS_V4_METRIC_DEFINITIONS.map((def) => [
      def.key,
      def.enumGroup['BASE_VALUES'] as (string | number)[],
    ]);

  buildVector(): string {
    const m = this.metrics;

    return [
      'CVSS:4.0',
      `AV:${m.attack_vector}`,
      `AC:${m.attack_complexity}`,
      `AT:${m.attack_requirements}`,
      `PR:${m.privileges_required}`,
      `UI:${m.user_interaction}`,
      `VC:${m.vuln_confidentiality}`,
      `VI:${m.vuln_integrity}`,
      `VA:${m.vuln_availability}`,
      `SC:${m.subsequent_confidentiality}`,
      `SI:${m.subsequent_integrity}`,
      `SA:${m.subsequent_availability}`,
    ].join('/');
  }
}

// ─── CvssV3VersionState ───────────────────────────────────────────────────────

type V3MetricKey = keyof CvssV3Metrics & string;

export class CvssV3VersionState extends CvssVersionState<
  CvssV3Metrics,
  V3MetricKey
> {
  @tracked metrics: CvssV3Metrics = { ...DEFAULT_CVSS_V3_METRICS };

  protected readonly version = 3;

  protected readonly unknownValues: Record<V3MetricKey, string | number> =
    DEFAULT_CVSS_V3_METRICS;

  protected readonly metricValidations: CvssMetricValidation<V3MetricKey> =
    CVSS_V3_METRIC_DEFINITIONS.map((def) => [
      def.key,
      def.enumGroup['BASE_VALUES'] as (string | number)[],
    ]);

  buildVector(): string {
    const m = this.metrics;

    return [
      'CVSS:3.1',
      `AV:${m.attack_vector}`,
      `AC:${m.attack_complexity}`,
      `PR:${m.privileges_required}`,
      `UI:${m.user_interaction}`,
      `S:${m.scope}`,
      `C:${m.confidentiality_impact}`,
      `I:${m.integrity_impact}`,
      `A:${m.availability_impact}`,
    ].join('/');
  }
}
