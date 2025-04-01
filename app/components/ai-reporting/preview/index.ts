import { service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type ReportRequestModel from 'irene/models/report-request';
import type { AdditionalFilter } from 'irene/models/report-request';
import type AiReportingService from 'irene/services/ai-reporting';
import type { FilterColumn } from 'irene/services/ai-reporting';

import type {
  ReportRequestPreview,
  PreviewFilterDetails,
} from 'irene/models/report-request';

interface AiReportingPreviewSignature {
  Args: { reportRequest: ReportRequestModel };
}

export default class AiReportingPreview extends Component<AiReportingPreviewSignature> {
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare aiReporting: AiReportingService;
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked reportPreview: null | ReportRequestPreview = null;
  @tracked filterDetails: PreviewFilterDetails[] = [];
  @tracked filterDrawerOpen = false;

  @tracked allColumnsMap: Map<string, FilterColumn> = new Map();

  @tracked additionalFilters: AdditionalFilter[] = [];

  constructor(owner: unknown, args: AiReportingPreviewSignature['Args']) {
    super(owner, args);
    this.previewReportRequest.perform();
  }

  get selectedColumns() {
    const columns: FilterColumn[] = [];

    this.allColumnsMap.forEach((column) => {
      if (column.selected) {
        columns.push(column);
      }
    });

    return columns.sort((a, b) => a.order - b.order);
  }

  get columns() {
    return this.selectedColumns.map((column) => {
      return {
        name: column.name,
        val_field: column.field,
        component: 'ai-reporting/preview/column-value',
      };
    });
  }

  get rows() {
    return this.reportPreview?.data || [];
  }

  get hasPreviewData() {
    return this.rows.length > 0;
  }

  @action
  handleFilterDrawerOpen() {
    this.filterDrawerOpen = true;
  }

  @action
  handleFilterDrawerClose() {
    this.filterDrawerOpen = false;
  }

  @action
  handleFilterDrawerApply(
    allColumnsMap: Map<string, FilterColumn>,
    additionalFilters: AdditionalFilter[] = []
  ) {
    this.allColumnsMap = allColumnsMap;
    this.additionalFilters = additionalFilters;

    console.log(this.additionalFilters);

    this.previewReportRequest.perform(false);
  }

  previewReportRequest = task(async (computeFiltersAndColumns = true) => {
    const reportRequest = this.args.reportRequest;

    if (!reportRequest.isRelevant) {
      return;
    }

    try {
      this.reportPreview = await reportRequest.previewReport(
        this.additionalFilters
      );

      if (computeFiltersAndColumns) {
        this.fetchFilterDetails.perform();

        this.allColumnsMap = this.aiReporting.getAllPreviewColumnsMap(
          this.reportPreview
        );
      }
    } catch (error) {
      this.notify.error(this.intl.t('reportModule.errorPreviewingReport'));
    }
  });

  fetchFilterDetails = task(async () => {
    const reportRequest = this.args.reportRequest;

    if (!reportRequest.isRelevant) {
      return;
    }

    try {
      const { filter_sections } = await reportRequest.filterDetails();

      this.filterDetails = filter_sections;
    } catch (error) {
      this.notify.error(this.intl.t('reportModule.errorFetchingFilterDetails'));
    }
  });

  downloadReport = task(async () => {
    const reportRequest = this.args.reportRequest;

    try {
      const report = this.store.createRecord('ai-reporting/report', {
        reportRequest: reportRequest,
        filters: this.additionalFilters,

        columns: this.selectedColumns.map((col) => ({
          label: col.name,
          field: col.field,
        })),
      });

      await report.save();

      const { url } = await report.downloadUrl();

      this.window.open(url, '_blank');
    } catch (error) {
      this.notify.error(this.intl.t('reportModule.errorDownloadingReport'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview': typeof AiReportingPreview;
  }
}
