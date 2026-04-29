import Component from '@glimmer/component';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { action } from '@ember/object';
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
  };
}

export default class StoreReleaseReadinessReportDrawerItemComponent extends Component<StoreReleaseReadinessReportDrawerItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

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
    return (
      this.report?.pdfStatus === ENUMS.PM_REPORT_STATUS.STARTED ||
      this.report?.pdfStatus === ENUMS.PM_REPORT_STATUS.IN_PROGRESS
    );
  }

  get isReportGenerated() {
    return this.report?.pdfStatus === ENUMS.PM_REPORT_STATUS.COMPLETED;
  }

  get showGenerateReport() {
    return (
      this.report?.refreshAvailable ||
      this.isReportGenerating ||
      !this.isReportGenerated
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

      await waitForPromise(
        (this.report as StoreReleaseReadinessReportModel).reload()
      );
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
