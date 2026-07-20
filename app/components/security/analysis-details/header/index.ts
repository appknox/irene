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
import type { AnalysisCvssUpdateDetails } from '..';
import { PASSED_CVSS_V4_METRICS } from 'irene/utils/cvss-metrics';

export interface SecurityAnalysisDetailsHeaderComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    currentCVSSMetrics: CvssV4Metrics;
    updateCVSSDetails(analysisCvssDetails: AnalysisCvssUpdateDetails): void;
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

  get analysisCurrentCvssVersionIsLegacy() {
    return (
      this.activeCvssVersion !== null &&
      this.activeCvssVersion !== this.currentCvssVersion
    );
  }

  get showMarkAsPassedButton() {
    if (this.analysisCurrentCvssVersionIsLegacy) {
      return true;
    }

    return !this.analysis?.isPassed;
  }

  get hideMarkAsPassedButton() {
    return this.activeCvssVersion !== this.currentCvssVersion;
  }

  get analysisStatus() {
    return this.statuses.find((s) => s.value === this.analysis?.status);
  }

  get cannotMarkAsPassedTooltipText() {
    return `You cannot mark an analysis as passed if the CVSS version is not updated to the latest version (CVSS v${this.activeCvssVersion})`;
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
    if (this.analysisCurrentCvssVersionIsLegacy) {
      this.notifications.error(this.cannotMarkAsPassedTooltipText);

      return;
    }

    this.markAsPassed.perform();
  }

  markAsPassed = task(async () => {
    try {
      const PASSED_CVSS_VECTOR =
        'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';

      const passedCVSSProperties = {
        cvssMetrics: PASSED_CVSS_V4_METRICS,
        cvssBase: 0.0,
        risk: ENUMS.RISK.NONE,
      };

      this.args.updateCVSSDetails(passedCVSSProperties);
      this.analysis?.set('status', ENUMS.ANALYSIS_STATUS.COMPLETED);

      // Update the analysis with the passed CVSS metrics
      await this.args.updateAnalysis();

      this.analysis?.setProperties({
        cvssVector: PASSED_CVSS_VECTOR,
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
