import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';
import { htmlSafe } from '@ember/template';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import type { FileCapiReportDetails } from 'irene/components/file-details/dynamic-scan/results/capis-report-drawer';
import type FileModel from 'irene/models/file';
import type IreneAjaxService from 'irene/services/ajax';

import FileCapiReportModel, {
  type FileCapiReportModelName,
  type FileCapiReportScanType,
} from 'irene/models/file-capi-report';

export interface FileDetailsDynamicScanResultsCapisReportDrawerReportItemSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    capiReport: FileCapiReportModel | null;
    reportDetails: FileCapiReportDetails;

    updateLatestReport: (
      report: FileCapiReportModel | null,
      type: FileCapiReportScanType
    ) => void;
  };
}

export default class FileDetailsDynamicScanResultsCapisReportDrawerReportItemComponent extends Component<FileDetailsDynamicScanResultsCapisReportDrawerReportItemSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare store: Store;
  @service declare ajax: IreneAjaxService;

  modelName: FileCapiReportModelName = 'file-capi-report';

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get fileCapiReport() {
    return this.args.capiReport;
  }

  get isReportGenerating() {
    return this.fileCapiReport?.isGenerating;
  }

  get isReportGenerated() {
    return this.fileCapiReport?.isGenerated;
  }

  get reportType() {
    return this.args.reportDetails.type;
  }

  get reportIsOutdated() {
    return this.fileCapiReport?.isOutdated;
  }

  get reportGenerationFailed() {
    return this.fileCapiReport?.reportGenerationFailed;
  }

  get reportShouldBeRegenerated() {
    return this.reportGenerationFailed || this.reportIsOutdated;
  }

  get reportIsDownloading() {
    return this.handleDownloadReport.isRunning;
  }

  get disableReportDownload() {
    return (
      this.reportIsDownloading ||
      this.isReportGenerating ||
      this.reportIsOutdated ||
      this.reportGenerationFailed
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

  @action getReport() {
    this.handleDownloadReport.perform();
  }

  @action
  reportRegenerateText(details: FileCapiReportDetails) {
    const message = details.reportGenerationFailed
      ? `<strong>"${details.primaryText}"</strong> Report generation failed. Please regenerate it again.`
      : `Note - To get the updated <strong>"${details.primaryText}"</strong>. Kindly redownload it again.`;

    return htmlSafe(message);
  }

  regenerateReport = task(async () => {
    if (!this.reportShouldBeRegenerated) {
      this.notify.error('Report cannot be regenerated.');

      return;
    }

    try {
      const capiReportsEndpoint = `${ENV.endpoints['files']}/${this.args.file.id}/capi_reports`;
      const url = `${capiReportsEndpoint}/${this.reportType}`;

      const report = (await this.ajax.post(url, {
        namespace: ENV.namespace_v2,
      })) as object;

      const normalizedReport = this.store.normalize('file-capi-report', report);
      const newReportModel = this.store.push(normalizedReport);

      this.args.updateLatestReport(
        newReportModel as FileCapiReportModel,
        this.reportType
      );
    } catch (error) {
      this.notify.error(
        parseError(
          error,
          `Problem while generating ${this.reportType.toUpperCase()} file`
        )
      );
    }
  });

  handleDownloadReport = task(async () => {
    try {
      let report: { url?: string } = {};

      if (this.fileCapiReport) {
        report = await waitForPromise(this.fileCapiReport.downloadReport());
      }

      if (report && report.url) {
        this.window.open(report.url, '_blank');
      } else {
        this.notify.error(this.intl.t('downloadUrlNotFound'));
      }
    } catch (error) {
      this.notify.error(
        parseError(error, this.intl.t('reportIsGettingGenerated'))
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::CapisReportDrawer::ReportItem': typeof FileDetailsDynamicScanResultsCapisReportDrawerReportItemComponent;
  }
}
