/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { action } from '@ember/object';
import { addObserver, removeObserver } from '@ember/object/observers';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type PrivacyReportModel from 'irene/models/privacy-report';
import type ClipboardJS from 'clipboard/src/clipboard';
import type RealtimeService from 'irene/services/realtime';
import type FileModel from 'irene/models/file';

export interface FileReportDrawerPrivacyReportsItemSignature {
  Args: {
    file?: FileModel | null;
    loading?: boolean;
    privacyReport: PrivacyReportModel | null;
  };
}

export default class FileReportDrawerPrivacyReportsItemComponent extends Component<FileReportDrawerPrivacyReportsItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare realtime: RealtimeService;

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: FileReportDrawerPrivacyReportsItemSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    addObserver(
      this.realtime,
      'PrivacyReportCounter',
      this,
      this.observePrivacyReportCounter
    );
  }

  willDestroy() {
    super.willDestroy();

    this.removePrivacyReportCounterObserver();
  }

  get privacyReport() {
    return this.args.privacyReport;
  }

  get reportPasswordText() {
    return this.intl.t('privacyModule.downloadPdfSecondaryText', {
      password: this.privacyReport?.reportPassword || '',
    });
  }

  observePrivacyReportCounter() {
    this.privacyReport?.reload();
  }

  removePrivacyReportCounterObserver() {
    removeObserver(
      this.realtime,
      'PrivacyReportCounter',
      this,
      this.observePrivacyReportCounter
    );
  }

  get isReportGenerating() {
    return (
      this.privacyReport?.pdfStatus === ENUMS.PM_REPORT_STATUS.STARTED ||
      this.privacyReport?.pdfStatus === ENUMS.PM_REPORT_STATUS.IN_PROGRESS
    );
  }

  get isReportGenerated() {
    return this.privacyReport?.pdfStatus === ENUMS.PM_REPORT_STATUS.COMPLETED;
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
        (this.privacyReport as PrivacyReportModel).downloadReport()
      );

      this.window.open(data.url, '_blank');
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });

  handleGenerateReport = task(async () => {
    try {
      await waitForPromise(
        (this.privacyReport as PrivacyReportModel).generateReport()
      );

      await waitForPromise((this.privacyReport as PrivacyReportModel).reload());
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::PrivacyReports::Item': typeof FileReportDrawerPrivacyReportsItemComponent;
  }
}
