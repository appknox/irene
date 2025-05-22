import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type { AiReportType } from '../report-download-drawer';
import type ReportRequestModel from 'irene/models/ai-reporting/report-request';

import type {
  AdditionalFilter,
  FilterColumn,
} from 'irene/models/ai-reporting/report-request';

interface AiReportingPreviewGenerateReportSignature {
  Args: {
    disabled: boolean;
    selectedColumns: FilterColumn[];
    addtionalFilters: AdditionalFilter[];
    reportRequest: ReportRequestModel;
  };
}

export default class AiReportingPreviewGenerateReport extends Component<AiReportingPreviewGenerateReportSignature> {
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare intl: IntlService;

  @tracked showReportDownloadDrawer = false;
  @tracked selectedReportType: AiReportType;

  constructor(
    owner: unknown,
    args: AiReportingPreviewGenerateReportSignature['Args']
  ) {
    super(owner, args);

    this.selectedReportType =
      (this.args.reportRequest.reportType as AiReportType) ?? 'csv';
  }

  get isLoadingReportDownload() {
    return this.fetchDownloadUrl.isRunning;
  }

  get hideInputs() {
    return ENV.environment !== 'test';
  }

  @action
  handleReportDownloadDrawerOpen() {
    this.showReportDownloadDrawer = true;
  }

  @action
  handleReportDownloadDrawerClose() {
    this.showReportDownloadDrawer = false;
  }

  @action
  handleReportDownload(reportType: AiReportType) {
    this.selectedReportType = reportType;

    this.handleReportDownloadDrawerClose();
    this.fetchDownloadUrl.perform();
  }

  fetchDownloadUrl = task(async () => {
    try {
      const reportRequest = this.args.reportRequest;

      const columns = this.args.selectedColumns.map((column) => ({
        label: column.name,
        field: column.field,
      }));

      const { url } = await reportRequest.downloadUrl({
        columns,
        report_type: this.selectedReportType,
        additional_filters: this.args.addtionalFilters,
      });

      this.window.open(url, '_blank');
    } catch (e) {
      const error = e as AdapterError;
      let errMsg = this.intl.t('reportModule.failedToDownload');

      if (error?.errors?.[0]?.detail) {
        const payload = JSON.parse(error.errors[0].detail);
        errMsg = payload?.message ?? errMsg;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::GenerateReport': typeof AiReportingPreviewGenerateReport;
  }
}
