import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';

import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type { CvssV4Metrics } from 'irene/models/security/analysis';

import type {
  AnalysisCvssUpdateDetails,
  AnalysisCvssUpdateDetailsLegacy,
} from '..';

import {
  PASSED_CVSS_V3_METRICS,
  PASSED_CVSS_V3_VECTOR,
  PASSED_CVSS_V4_METRICS,
  PASSED_CVSS_V4_VECTOR,
} from 'irene/utils/cvss-metrics';

import {
  SECURITY_ANALYSIS_AEIS_PASSED_OVERRIDE,
  aeisOverrideUrl,
} from 'irene/utils/security-aeis';

import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';

import type IreneAjaxService from 'irene/services/ajax';

export interface SecurityAnalysisDetailsHeaderComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    isKnoxIqEnabled?: boolean;
    hasValidatedFindings?: boolean;
    onMarkedAsPassed?: () => void;
    currentCVSSMetrics: CvssV4Metrics;
    updateCVSSDetails(analysisCvssDetails: AnalysisCvssUpdateDetails): void;
    updateLegacyCVSSDetails(
      analysisCvssDetails: AnalysisCvssUpdateDetailsLegacy
    ): void;
    updateAnalysis(): Promise<unknown>;
  };
}

export default class SecurityAnalysisDetailsHeaderComponent extends Component<SecurityAnalysisDetailsHeaderComponentSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service declare notifications: NotificationService;

  @tracked showMarkPassedConfirmBox = false;

  statuses = ENUMS.ANALYSIS_STATUS.CHOICES;

  get analysis() {
    return this.args.analysis;
  }

  get activeCvssVersion() {
    return this.analysis?.activeCvssVersion;
  }

  get currentCvssVersion() {
    return this.analysis?.cvssVersion;
  }

  get showMarkAsPassedButton() {
    if (!this.analysis?.isPassed) {
      return true;
    }

    // A KnoxIQ analysis is only fully passed once AEIS carries the passed
    // override and its validated findings are gone, so the action stays
    // available until both hold.
    return (
      Boolean(this.args.isKnoxIqEnabled) &&
      (!this.analysis?.hasPassedAeisOverride ||
        Boolean(this.args.hasValidatedFindings))
    );
  }

  get analysisStatus() {
    return this.statuses.find((s) => s.value === this.analysis?.status);
  }

  get ireneAnalysisRoute() {
    return this.args.isKnoxIqEnabled ? 'knox-analysis' : 'analysis';
  }

  get ireneFilePath() {
    if (this.analysis?.file) {
      const fileId = this.analysis.file.get('id');
      const ireneHost = ENV['ireneHost'];

      return [
        ireneHost,
        'dashboard/file',
        fileId,
        this.ireneAnalysisRoute,
        this.analysis?.id,
      ].join('/');
    }

    return '';
  }

  get markPassedConfirmTitle() {
    return this.args.isKnoxIqEnabled
      ? this.intl.t('securityAnalysisDetails.header.markAsPassedConfirmKnoxIq')
      : this.intl.t('securityAnalysisDetails.header.markAsPassedConfirm');
  }

  get markPassedConfirmDescription() {
    return this.args.isKnoxIqEnabled
      ? this.intl.t(
          'securityAnalysisDetails.header.markAsPassedDeletesFindings'
        )
      : '';
  }

  @action selectStatus(param: { value: SecurityAnalysisModel['status'] }) {
    this.analysis?.set('status', param.value);
  }

  @action openMarkPassedConfirmBox() {
    this.showMarkPassedConfirmBox = true;
  }

  @action closeMarkPassedConfirmBox() {
    this.showMarkPassedConfirmBox = false;
  }

  @action triggerMarkAsPassed() {
    this.markAsPassed.perform();
  }

  /**
   * Mirrors the canonical passed CVSS vector onto AEIS. The backend has no
   * concept of marking an analysis passed, so the dashboard writes it.
   */
  async applyPassedAeisOverride() {
    const analysis = this.analysis;

    if (
      analysis?.exploitabilityScore === null ||
      analysis?.exploitabilityScore === undefined
    ) {
      return;
    }

    await this.ajax.put(aeisOverrideUrl(analysis.id), {
      namespace: ENV.namespace_v2,
      data: JSON.stringify(SECURITY_ANALYSIS_AEIS_PASSED_OVERRIDE),
    });

    await analysis.reload();
  }

  /**
   * A passed analysis has nothing left to validate. The deletes run in
   * sequence so a partial failure surfaces rather than leaving the rest in
   * flight.
   */
  async deleteValidatedFindings() {
    const analysis = this.analysis;

    if (!analysis?.isKnoxIqAnalysis) {
      return;
    }

    const findings = await this.store.query('security/validated-finding', {
      analysisId: analysis.id,
    });

    const adapterOptions = { analysisId: String(analysis.id) };

    for (const finding of findings.slice()) {
      await (finding as SecurityValidatedFindingModel).destroyRecord({
        adapterOptions,
      });
    }
  }

  markAsPassed = task(async () => {
    try {
      const passedCVSSProperties = {
        cvssMetrics: PASSED_CVSS_V4_METRICS,
        cvssBase: 0.0,
        risk: ENUMS.RISK.NONE,
      };

      const passedLegacyCVSSProperties = {
        cvssMetrics: PASSED_CVSS_V3_METRICS,
        cvssBase: 0.0,
        risk: ENUMS.RISK.NONE,
      };

      this.args.updateCVSSDetails(passedCVSSProperties);
      this.args.updateLegacyCVSSDetails(passedLegacyCVSSProperties);
      this.analysis?.set('status', ENUMS.ANALYSIS_STATUS.COMPLETED);

      // Update the analysis with the passed CVSS metrics
      await this.args.updateAnalysis();

      this.analysis?.setProperties({
        cvssVector: PASSED_CVSS_V4_VECTOR,
        cvssVersion: this.activeCvssVersion ?? this.currentCvssVersion,
        legacyCvssVector: PASSED_CVSS_V3_VECTOR,
        legacyCvssMetrics: PASSED_CVSS_V3_METRICS,
        legacyCvssBase: 0.0,
        legacyCvssRisk: ENUMS.RISK.NONE,
        ...passedCVSSProperties,
      });

      await this.applyPassedAeisOverride();
      await this.deleteValidatedFindings();

      this.args.onMarkedAsPassed?.();

      this.notifications.success('Analysis Updated');
      this.closeMarkPassedConfirmBox();
    } catch (error) {
      this.notifications.error(
        parseError(error, this.intl.t('pleaseTryAgain'))
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Header': typeof SecurityAnalysisDetailsHeaderComponent;
  }
}
