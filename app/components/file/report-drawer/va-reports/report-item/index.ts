import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';
import Store from '@ember-data/store';
import { waitForPromise } from '@ember/test-waiters';

import ClipboardJS from 'clipboard/src/clipboard';

import FileReportModel, { FileReportModelName } from 'irene/models/file-report';
import { FileReportDetails } from 'irene/components/file/report-drawer/va-reports';

export interface FileReportDrawerVaReportsReportItemSignature {
  Element: HTMLElement;
  Args: {
    fileReport?: FileReportModel | null;
    reportDetails: FileReportDetails;
  };
}

export default class FileReportDrawerVaReportsReportItemComponent extends Component<FileReportDrawerVaReportsReportItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare store: Store;

  modelName: FileReportModelName = 'file-report';

  // translation variables
  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: FileReportDrawerVaReportsReportItemSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  }

  get fileReport() {
    return this.args.fileReport;
  }

  get isReportGenerating() {
    return this.fileReport?.isGenerating;
  }

  get isReportGenerated() {
    return this.fileReport?.isGenerated;
  }

  get reportType() {
    return this.args.reportDetails.type;
  }

  get isSummaryReport() {
    const summaryReportTypes = ['csv', 'xlsx'];

    return summaryReportTypes.includes(this.reportType);
  }

  get showDownloadButton() {
    return this.isSummaryReport || !this.isReportGenerating;
  }

  get showGeneratingText() {
    return !this.isSummaryReport && this.isReportGenerating;
  }

  get reportIsDownloading() {
    return this.getReportByType.isRunning;
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

  @action getReport() {
    this.getReportByType.perform();
  }

  getReportByType = task(async () => {
    try {
      let report;

      if (this.fileReport) {
        report = await waitForPromise(
          this.fileReport.getReportByType(this.reportType)
        );
      }

      if (report && report.url) {
        this.window.open(report.url, '_blank');
      } else {
        this.notify.error(this.intl.t('downloadUrlNotFound'));
      }
    } catch {
      this.notify.error(this.intl.t('reportIsGettingGenerated'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::VaReports::ReportItem': typeof FileReportDrawerVaReportsReportItemComponent;
  }
}
