import Component from '@glimmer/component';
import { action } from '@ember/object';
import { runTask } from 'ember-lifeline';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';

import {
  CvssV4VersionState,
  CvssV3VersionState,
  computeCVSSMetrics,
  type CVSSCalculateAPIResponse,
} from 'irene/utils/cvss';

import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type IreneAjaxService from 'irene/services/ajax';

import type {
  CvssV3Metrics,
  CvssV4Metrics,
} from 'irene/models/security/analysis';

import {
  DEFAULT_CVSS_V3_METRICS,
  PASSED_CVSS_V3_METRICS,
} from 'irene/utils/cvss-metrics';

export type AnalysisCvssUpdateDetails = {
  cvssMetrics: CvssV4Metrics;
  cvssBase: number;
  risk: number;
};

export interface AnalysisCvssUpdateDetailsLegacy
  extends Omit<AnalysisCvssUpdateDetails, 'cvssMetrics'> {
  cvssMetrics: CvssV3Metrics;
}

export interface SecurityAnalysisDetailsComponentSignature {
  Args: {
    analysisDetails: SecurityAnalysisModel | null;
  };
}

export default class SecurityAnalysisDetailsComponent extends Component<SecurityAnalysisDetailsComponentSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare notifications: NotificationService;
  @service declare ajax: IreneAjaxService;

  @tracked isSaveActionOnly = false;

  @tracked analysisDetails: SecurityAnalysisModel | null = null;

  readonly v4State = new CvssV4VersionState();
  readonly v3State = new CvssV3VersionState();

  constructor(
    owner: unknown,
    args: SecurityAnalysisDetailsComponentSignature['Args']
  ) {
    super(owner, args);

    this.analysisDetails = this.args.analysisDetails;

    runTask(this, () => this.setDefaultCVSSDetails());
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get hasLegacyCvssData() {
    return this.analysisDetails?.legacyCvssVersion !== null;
  }

  get cvssMetrics() {
    return this.analysisDetails?.cvssMetrics as CvssV4Metrics | CvssV3Metrics;
  }

  get analysisActiveCvssVersion() {
    return this.analysisDetails?.activeCvssVersion;
  }

  get analysisIsV4WithoutLegacyCvss() {
    return (
      !this.hasLegacyCvssData &&
      this.analysisCurrentCvssVersion === ENUMS.SUPPORTED_CVSS_VERSIONS.V4
    );
  }

  get legacyCVSSIsPassed() {
    return this.analysisDetails?.legacyCvssRisk === ENUMS.RISK.NONE;
  }

  get analysisCurrentCvssVersion() {
    return this.analysisDetails?.cvssVersion;
  }

  get analysisLegacyCvssVersion() {
    return this.hasLegacyCvssData
      ? this.analysisDetails?.legacyCvssVersion
      : this.analysisIsV4WithoutLegacyCvss
        ? ENUMS.SUPPORTED_CVSS_VERSIONS.V3
        : this.analysisCurrentCvssVersion;
  }

  get analysisCurrentCvssIsLegacyCvss() {
    return this.analysisCurrentCvssVersion !== this.analysisActiveCvssVersion;
  }

  get activeAnalysisRiskLabelClass() {
    return this.v4State.riskLabelClass;
  }

  get currentCVSSDetails() {
    return {
      ...this.v4State.details,
      version: Number(this.analysisCurrentCvssVersion),
    };
  }

  get legacyCVSSDetails() {
    return {
      ...this.v3State.details,
      version: Number(this.analysisLegacyCvssVersion),
    };
  }

  @action triggerUpdateCurrentCVSSDetails(
    details: AnalysisCvssUpdateDetails
  ): void {
    this.v4State.applyMetrics(details.cvssMetrics);
    this.v4State.base = details.cvssBase;
    this.v4State.risk = details.risk;

    this.recalculateCVSSScore.perform(this.v4State);
  }

  @action triggerUpdateLegacyCVSSDetails(
    details: AnalysisCvssUpdateDetailsLegacy
  ): void {
    this.v3State.applyMetrics(details.cvssMetrics);
    this.v3State.base = details.cvssBase;
    this.v3State.risk = details.risk;

    this.recalculateCVSSScore.perform(this.v3State);
  }

  @action triggerSaveAnalysis(backToFilePage: boolean) {
    this.isSaveActionOnly = !backToFilePage;
    this.saveAnalysis.perform(backToFilePage);
  }

  @action setDefaultCVSSDetails(): void {
    this.hydrateCVSSV4State();
    this.hydrateCVSSV3State();
  }

  @action async triggerUpdateAnalysis(): Promise<void> {
    await this.updateAnalysis.perform();
  }

  private hydrateCVSSV4State(): void {
    if (this.analysisCurrentCvssVersion !== ENUMS.SUPPORTED_CVSS_VERSIONS.V4) {
      return;
    }

    const metrics = this.analysisDetails?.cvssMetrics;

    this.v4State.applyMetrics(metrics as CvssV4Metrics);
    this.v4State.base = this.analysisDetails?.cvssBase as number;
    this.v4State.risk = this.analysisDetails?.risk as number;
  }

  private hydrateCVSSV3State(): void {
    const { metrics, base, vector, risk } = this.resolveV3StateSource(
      this.analysisDetails
    );

    this.v3State.applyMetrics(metrics);
    this.v3State.base = base;
    this.v3State.vector = vector;
    this.v3State.risk = risk;
  }

  private resolveV3StateSource(details: SecurityAnalysisModel | null) {
    // Case 1: legacy data exists and analysis is not passed
    const commonLegacyCVSSDetails = {
      base: details?.legacyCvssBase as number,
      vector: details?.legacyCvssVector as string,
      risk: details?.legacyCvssRisk as number,
    };

    if (this.hasLegacyCvssData && !this.legacyCVSSIsPassed) {
      return {
        metrics: details?.legacyCvssMetrics as CvssV3Metrics,
        ...commonLegacyCVSSDetails,
      };
    }

    // Case 2: legacy data exists but analysis is passed
    if (this.hasLegacyCvssData && this.legacyCVSSIsPassed) {
      return {
        metrics: PASSED_CVSS_V3_METRICS,
        ...commonLegacyCVSSDetails,
      };
    }

    // Case 3: v4 analysis with no legacy data — v3 panel starts blank
    if (this.analysisIsV4WithoutLegacyCvss) {
      return {
        metrics: DEFAULT_CVSS_V3_METRICS,
        base: -1.0,
        vector: '',
        risk: ENUMS.RISK.UNKNOWN,
      };
    }

    // Case 4: v3 analysis with no legacy data — use current CVSS fields directly
    const isPassed =
      !this.hasLegacyCvssData &&
      this.analysisCurrentCvssIsLegacyCvss &&
      details?.risk === ENUMS.RISK.NONE;

    return {
      metrics: isPassed
        ? PASSED_CVSS_V3_METRICS
        : (this.cvssMetrics as CvssV3Metrics),
      base: details?.cvssBase as number,
      vector: details?.cvssVector as string,
      risk: details?.risk as number,
    };
  }

  private assertVectorsAreValid(): void {
    // If CVSS v4 is invalid, throw an error
    if (!this.v4State.isValid) {
      throw new Error('Invalid CVSS v4 metrics');
    }

    // If CVSS v3 is invalid, throw an error
    if (!this.v3State.isValid) {
      throw new Error('Invalid CVSS v3 metrics');
    }

    // If CVSS v4 is empty and the current CVSS version is not legacy, throw an error
    if (this.analysisCurrentCvssIsLegacyCvss && this.v4State.isEmpty) {
      throw new Error(
        'Please first provide a valid CVSS v4 metric for the current CVSS version. Only then can you update the analysis or mark as untested.'
      );
    }

    // If analysis status is not started and either CVSS v4 or v3 is empty, throw an error
    if (
      this.analysisDetails?.status === ENUMS.ANALYSIS_STATUS.WAITING &&
      (this.v4State.isEmpty || this.v3State.isEmpty) &&
      this.analysisCurrentCvssIsLegacyCvss
    ) {
      throw new Error(
        'Please first provide a valid CVSS v4 and v3 metric for the current CVSS version. Only then can you update an UNTESTED analysis.'
      );
    }
  }

  private async buildAnalysisPayload(): Promise<Record<string, unknown>> {
    const details = this.analysisDetails;

    const [
      owasp,
      owaspmobile2024,
      owaspapi2023,
      pcidss,
      pcidss4,
      hipaa,
      masvs,
      mstg,
      asvs,
      cwe,
      gdpr,
      nistsp800171,
      nistsp80053,
      sama,
    ] = await Promise.all([
      details?.owasp,
      details?.owaspmobile2024,
      details?.owaspapi2023,
      details?.pcidss,
      details?.pcidss4,
      details?.hipaa,
      details?.masvs,
      details?.mstg,
      details?.asvs,
      details?.cwe,
      details?.gdpr,
      details?.nistsp800171,
      details?.nistsp80053,
      details?.sama,
    ]);

    // Normalise status: Ember Data may hand back a boxed object pre-save.
    const status = details?.status as number | { value: number };

    if (typeof status === 'object') {
      details?.set('status', status.value);
    }

    // Same normalisation for overridden_risk.
    let overriddenRisk = details?.overriddenRisk as number | { value: number };

    if (typeof overriddenRisk === 'object' && !isEmpty(overriddenRisk)) {
      overriddenRisk = overriddenRisk.value;
    }

    return {
      risk: this.v4State.risk,
      legacy_cvss_risk: this.v3State.risk,
      status,
      findings: details?.findings,
      owasp: owasp?.map((a) => a.id),
      owaspmobile2024: owaspmobile2024?.map((a) => a.id),
      owaspapi2023: owaspapi2023?.map((a) => a.id),
      pcidss: pcidss?.map((a) => a.id),
      pcidss4: pcidss4?.map((a) => a.id),
      hipaa: hipaa?.map((a) => a.id),
      mstg: mstg?.map((a) => a.id),
      masvs: masvs?.map((a) => a.id),
      asvs: asvs?.map((a) => a.id),
      cwe: cwe?.map((a) => a.id),
      gdpr: gdpr?.map((a) => a.id),
      nistsp80053: nistsp80053?.map((a) => a.id),
      nistsp800171: nistsp800171?.map((a) => a.id),
      sama: sama?.map((a) => a.id),
      overridden_risk: overriddenRisk,
      overridden_risk_comment: details?.overriddenRiskComment,
      overridden_risk_to_profile: details?.overriddenRiskToProfile,
      cvss_vector: this.v4State.vector,
      legacy_cvss_vector: this.v3State.vector,
      active_cvss_vector_fields: computeCVSSMetrics(this.v4State.metrics),
      legacy_cvss_vector_fields: computeCVSSMetrics(this.v3State.metrics),
    };
  }

  recalculateCVSSScore = task(
    async (state: CvssV4VersionState | CvssV3VersionState) => {
      if (state.isEmpty) {
        state.isInvalidBase = false;

        return;
      }

      if (!state.isValid) {
        state.isInvalidBase = true;

        return;
      }

      const vector = state.buildVector();

      try {
        const data = await this.ajax.request<CVSSCalculateAPIResponse>(
          `cvss?vector=${vector}`
        );

        state.applyScore(data, vector);
      } catch (error) {
        this.notifications.error(parseError(error, this.tPleaseTryAgain));
      }
    }
  );

  saveAnalysis = task(async (backToFilePage = false) => {
    try {
      const response = await this.updateAnalysis.perform();
      await this.analysisDetails?.reload();

      // This is manually set because for some weird reasons Ember Data is not updating the cvssMetrics field when doing this.analysisDetails?.reload();
      this.analysisDetails?.set('cvssMetrics', response['cvss_metrics']);
      this.analysisDetails?.set('cvssVector', response['cvss_vector']);
      this.analysisDetails?.set('cvssBase', response['cvss_base']);
      this.analysisDetails?.set('risk', response['risk']);

      this.setDefaultCVSSDetails();

      // Return to the file page if requested
      if (backToFilePage) {
        this.router.transitionTo(
          'authenticated.security.file',
          this.analysisDetails?.file.get('id') as string
        );
      }

      this.notifications.success('Analysis Updated');
    } catch (err) {
      this.notifications.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  updateAnalysis = task(async () => {
    this.assertVectorsAreValid();

    const payload = await this.buildAnalysisPayload();
    const url = [ENV.endpoints['analyses'], this.analysisDetails?.id].join('/');

    return (await this.ajax.put(url, {
      namespace: 'api/hudson-api',
      data: JSON.stringify(payload),
    })) as Record<string, unknown>;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails': typeof SecurityAnalysisDetailsComponent;
  }
}
