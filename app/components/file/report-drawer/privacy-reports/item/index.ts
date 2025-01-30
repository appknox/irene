import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { action } from '@ember/object';
import { addObserver, removeObserver } from '@ember/object/observers';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import PrivacyReportModel, {
  PrivacyReportStatus,
} from 'irene/models/privacy-report';
import type ClipboardJS from 'clipboard/src/clipboard';
import type RealtimeService from 'irene/services/realtime';
import type Store from '@ember-data/store';
import type FileModel from 'irene/models/file';

export interface FileReportDrawerPrivacyReportsItemSignature {
  Args: {
    file?: FileModel;
  };
}

export default class FileReportDrawerPrivacyReportsItemComponent extends Component<FileReportDrawerPrivacyReportsItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare realtime: RealtimeService;
  @service declare store: Store;

  @tracked privacyReport: PrivacyReportModel | null = null;

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: FileReportDrawerPrivacyReportsItemSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    this.fetchPrivacyReports.perform();

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

  fetchPrivacyReports = task(async () => {
    try {
      this.privacyReport = await this.store.queryRecord('privacy-report', {
        fileId: this.args.file?.id,
      });
    } catch (e) {
      const error = e as AdapterError;

      if (error.errors?.[0]?.status === '404') {
        const createReport = this.store.createRecord('privacy-report', {
          fileId: this.args.file?.id,
        });

        this.privacyReport = await waitForPromise(createReport.save());
      } else {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  });

  get isReportGenerating() {
    return (
      this.privacyReport?.pdfStatus === PrivacyReportStatus.STARTED ||
      this.privacyReport?.pdfStatus === PrivacyReportStatus.IN_PROGRESS
    );
  }

  get isReportGenerated() {
    return this.privacyReport?.pdfStatus === PrivacyReportStatus.COMPLETED;
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
