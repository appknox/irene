import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

import type { AiReportType } from '../report-download-drawer';
import type { AdditionalFilter } from 'irene/models/report-request';
import type { FilterColumn } from 'irene/services/ai-reporting';
import type IntlService from 'ember-intl/services/intl';
import type ReportRequestModel from 'irene/models/report-request';

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
  @service declare intl: IntlService;

  @tracked downloadUrl: string | null = null;
  @tracked isGenerating = false;
  @tracked showReportDownloadDrawer = false;
  @tracked selectedReportType: AiReportType;

  constructor(
    owner: unknown,
    args: AiReportingPreviewGenerateReportSignature['Args']
  ) {
    super(owner, args);

    console.log(this.args.reportRequest.reportType);

    this.selectedReportType =
      (this.args.reportRequest.reportType as AiReportType) ?? 'csv';
  }

  get downloadColumns() {
    const cols = this.args.selectedColumns.map((column) => ({
      label: column.name,
      field: column.field,
    }));

    return JSON.stringify(cols);
  }

  get downloadAdditionalFilters() {
    return JSON.stringify(this.args.addtionalFilters);
  }

  get isLoadingReportDownload() {
    return this.fetchDownloadUrl.isRunning || this.isGenerating;
  }

  @action
  handleDownloadReset() {
    this.isGenerating = false;
    this.downloadUrl = null;
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

      const { url } = await reportRequest.downloadUrl();

      this.downloadUrl = url;
      this.isGenerating = true;
    } catch (e) {
      this.notify.error(this.intl.t('reportModule.failedToDownload'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::GenerateReport': typeof AiReportingPreviewGenerateReport;
  }
}
