import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import ClipboardJS from 'clipboard/src/clipboard';

import { type FileLegacyCvssReportModelName } from 'irene/models/file-legacy-cvss-report';
import type { FileLegacyCvssReportDetails } from 'irene/components/file/report-drawer/legacy-cvss-reports';
import type FileLegacyCvssReportModel from 'irene/models/file-legacy-cvss-report';

export interface FileReportDrawerLegacyCvssReportsReportItemSignature {
  Element: HTMLElement;
  Args: {
    fileReport?: FileLegacyCvssReportModel | null;
    reportDetails: FileLegacyCvssReportDetails;
  };
}

export default class FileReportDrawerLegacyCvssReportsReportItemComponent extends Component<FileReportDrawerLegacyCvssReportsReportItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  modelName: FileLegacyCvssReportModelName = 'file-legacy-cvss-report';

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: FileReportDrawerLegacyCvssReportsReportItemSignature['Args']
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

  get reportType() {
    return this.args.reportDetails.type;
  }

  get isSummaryReport() {
    return ['csv', 'xlsx'].includes(this.reportType);
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

  @action
  getReport() {
    this.getReportByType.perform();
  }

  getReportByType = task(async () => {
    if (!this.fileReport) {
      return;
    }

    try {
      const report = await waitForPromise(
        this.fileReport.getReportByType(this.reportType)
      );

      if (report?.url) {
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
    'File::ReportDrawer::LegacyCvssReports::ReportItem': typeof FileReportDrawerLegacyCvssReportsReportItemComponent;
  }
}
