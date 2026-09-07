import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
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

export interface SecurityAnalysisDetailsHeaderComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
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
    return !this.analysis?.isPassed;
  }

  get analysisStatus() {
    return this.statuses.find((s) => s.value === this.analysis?.status);
  }

  get ireneFilePath() {
    if (this.analysis?.file) {
      const fileId = this.analysis.file.get('id');
      const ireneHost = ENV['ireneHost'];

      return [
        ireneHost,
        'dashboard/file',
        fileId,
        'analysis',
        this.analysis?.id,
      ].join('/');
    }

    return '';
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
