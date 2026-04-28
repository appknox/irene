import Component from '@glimmer/component';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type ClipboardJS from 'clipboard/src/clipboard';
import type StoreReleaseReadinessReportModel from 'irene/models/store-release-readiness-report';
import './index.scss';

export interface StoreReleaseReadinessReportDrawerItemSignature {
  Args: {
    loading?: boolean;
    report: StoreReleaseReadinessReportModel | null;
    onGenerate?: () => void;
  };
}

export default class StoreReleaseReadinessReportDrawerItemComponent extends Component<StoreReleaseReadinessReportDrawerItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @tracked waitingForReportCompletion = false;

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: StoreReleaseReadinessReportDrawerItemSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  }

  get report() {
    return this.args.report;
  }

  get reportPasswordText() {
    return this.intl.t('storeReleaseReadinessModule.downloadPdfSecondaryText', {
      password: this.report?.reportPassword || '',
    });
  }

  get isReportGenerating() {
    if (this.isReportGenerated) {
      return false;
    }

    return (
      this.report?.pdfStatus === ENUMS.PM_REPORT_STATUS.STARTED ||
      this.report?.pdfStatus === ENUMS.PM_REPORT_STATUS.IN_PROGRESS
    );
  }

  get isReportGenerated() {
    const progress = this.report?.pdfProgress ?? 0;

    return (
      this.report?.pdfStatus === ENUMS.PM_REPORT_STATUS.COMPLETED ||
      progress >= 100
    );
  }

  get isGenerateButtonLoading() {
    return (
      this.handleGenerateReport.isRunning ||
      (this.waitingForReportCompletion && !this.isReportGenerated)
    );
  }

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info(this.intl.t('passwordCopied'));

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error(this.tPleaseTryAgain);
  }

  handleDownloadReport = task(async () => {
    try {
      const data = await waitForPromise(
        (this.report as StoreReleaseReadinessReportModel).downloadReport()
      );

      this.window.open(data.url, '_blank');
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });

  handleGenerateReport = task(async () => {
    try {
      await waitForPromise(
        (this.report as StoreReleaseReadinessReportModel).generateReport()
      );
      // Store release readiness report API doesn't expose GET /reports/:id,
      // so avoid model.reload() (which triggers that route and 404s).
      // Reflect generation state locally to keep UI aligned.
      if (this.report) {
        this.report.pdfStatus = ENUMS.PM_REPORT_STATUS.STARTED;
        this.report.pdfProgress = Math.max(this.report.pdfProgress ?? 0, 0);
      }
      this.waitingForReportCompletion = true;
      this.args.onGenerate?.();
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::ReportDrawer::Item': typeof StoreReleaseReadinessReportDrawerItemComponent;
  }
}
