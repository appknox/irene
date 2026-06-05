import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENUMS from 'irene/enums';
import type IntlService from 'ember-intl/services/intl';

import type {
  CvssV3Metrics,
  CvssV4Metrics,
  SecurityAnalysisRiskLabelClass,
} from 'irene/models/security/analysis';

import {
  getMetricLabel,
  CVSS_V4_METRIC_DEFINITIONS,
  CVSS_V3_METRIC_DEFINITIONS,
  DEFAULT_CVSS_V4_METRICS,
  type CvssMetricOptionData,
  type CvssV4MetricKey,
  type CvssV3MetricKey,
} from 'irene/utils/cvss-metrics';

import type SecurityAnalysisModel from 'irene/models/security/analysis';

import type {
  AnalysisCvssUpdateDetails,
  AnalysisCvssUpdateDetailsLegacy,
} from 'irene/components/security/analysis-details';

export interface CVSSDetails {
  version: number;
  vector: string;
  base: number;
  risk: number;
  riskLabelClass: SecurityAnalysisRiskLabelClass | undefined;
  metrics: CvssV3Metrics | CvssV4Metrics;
  isInValidCvssBase: boolean;
}

export interface SecurityAnalysisDetailsCvssMetricsComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    currentCVSSDetails: CVSSDetails;
    legacyCVSSDetails: CVSSDetails;
    updateCurrentCVSSDetails(cvssDetails: AnalysisCvssUpdateDetails): void;
    updateLegacyCVSSDetails(cvssDetails: AnalysisCvssUpdateDetailsLegacy): void;
  };
}

export default class SecurityAnalysisDetailsCvssMetricsComponent extends Component<SecurityAnalysisDetailsCvssMetricsComponentSignature> {
  @service declare intl: IntlService;
  @tracked isLegacyCvssExpanded = false;

  get hasLegacyCvssData() {
    return this.args.analysis && this.args.analysis.legacyCvssVersion !== null;
  }

  get analysisCurrentCvssIsLegacyCvss() {
    return (
      this.args.analysis?.cvssVersion !== this.args.analysis?.activeCvssVersion
    );
  }

  get analysisActiveCvssVersion() {
    return this.args.analysis?.activeCvssVersion;
  }

  get currentCVSSDetails() {
    return this.args.currentCVSSDetails;
  }

  get currentCVSSMetrics() {
    return this.args.currentCVSSDetails.metrics as CvssV4Metrics;
  }

  get legacyCVSSDetails() {
    return this.args.legacyCVSSDetails;
  }

  get legacyCVSSMetrics() {
    return this.legacyCVSSDetails.metrics as CvssV3Metrics;
  }

  get legacyCvssRisk() {
    return Number(this.legacyCVSSDetails.risk);
  }

  get legacyCVSSTitle() {
    const { version, vector, isInValidCvssBase, risk, base } =
      this.legacyCVSSDetails;

    const isPassed = risk === ENUMS.RISK.NONE;
    const isUntested = base === -1.0 && risk === ENUMS.RISK.UNKNOWN;

    const vectorText = isInValidCvssBase
      ? ' [INVALID VECTOR]'
      : isPassed
        ? ' [PASSED]'
        : isUntested
          ? ' [UNTESTED]'
          : vector
            ? ` [${vector}]`
            : '';

    return `Legacy CVSS${version ? ` v${version}` : ''}${vectorText}`;
  }

  get currentCVSSSelectDataList() {
    return CVSS_V4_METRIC_DEFINITIONS.map((def) => ({
      label: this.intl.t(def.metricTranslationKey),
      key: def.key,
      selected: this.currentCVSSMetrics[def.key],
      options: def.options,
      onSelect: this.onMetricSelect(def.key),
      getOptionLabel: (value: CvssMetricOptionData) =>
        getMetricLabel(def.enumGroup, value),
    }));
  }

  get legacyCVSSSelectDataList() {
    return CVSS_V3_METRIC_DEFINITIONS.map((def) => ({
      label: this.intl.t(def.metricTranslationKey),
      key: def.key,
      selected: this.legacyCVSSMetrics[def.key],
      options: def.options,
      onSelect: this.onLegacyMetricSelect(def.key),
      getOptionLabel: (value: CvssMetricOptionData) =>
        getMetricLabel(def.enumGroup, value),
    }));
  }

  @action onMetricSelect(key: CvssV4MetricKey) {
    return this.buildMetricHandler(
      key,
      this.currentCVSSMetrics,
      this.currentCVSSDetails,
      this.args.updateCurrentCVSSDetails
    );
  }

  @action onLegacyMetricSelect(key: CvssV3MetricKey) {
    return this.buildMetricHandler(
      key,
      this.legacyCVSSMetrics,
      this.legacyCVSSDetails,
      this.args.updateLegacyCVSSDetails
    );
  }

  @action handleToggleLegacyCvss() {
    this.isLegacyCvssExpanded = !this.isLegacyCvssExpanded;
  }

  @action setActiveCVSSDetailsToUntested() {
    this.args.updateCurrentCVSSDetails({
      cvssMetrics: DEFAULT_CVSS_V4_METRICS,
      cvssBase: -1.0,
      risk: ENUMS.RISK.UNKNOWN,
    });
  }

  private buildMetricHandler<T extends CvssV3Metrics | CvssV4Metrics>(
    key: keyof T,
    metrics: T,
    details: CVSSDetails,
    updateHandler: (payload: {
      cvssMetrics: T;
      cvssBase: number;
      risk: number;
    }) => void
  ) {
    return (param: CvssMetricOptionData) => {
      updateHandler({
        cvssMetrics: { ...metrics, [key]: param } as T,
        cvssBase: details.base,
        risk: details.risk,
      });
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::CvssMetrics': typeof SecurityAnalysisDetailsCvssMetricsComponent;
  }
}
