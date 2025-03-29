import { service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type ReportRequestModel from 'irene/models/report-request';

import type { ReportRequestPreview } from 'irene/models/report-request';

export interface FilterColumn {
  name: string;
  field: string;
  selected: boolean;
  order: number;
  default?: boolean;
}

interface AiReportingPreviewSignature {
  Args: { reportRequest: ReportRequestModel };
}

export default class AiReportingPreview extends Component<AiReportingPreviewSignature> {
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked reportPreview: null | ReportRequestPreview = null;
  @tracked filterDrawerOpen = false;
  @tracked selectedColumns: FilterColumn[] = [];

  constructor(owner: unknown, args: AiReportingPreviewSignature['Args']) {
    super(owner, args);
    this.previewReportRequest.perform();
  }

  get defaultAvailableColumns() {
    return (this.reportPreview?.columns || []).map((column, idx) => ({
      name: column.label,
      field: column.field,
      selected: true,
      order: idx,
      default: true,
    }));
  }

  get filteredColumns() {
    if (this.selectedColumns.length > 0) {
      return this.selectedColumns;
    }

    return this.defaultAvailableColumns;
  }

  get filteredColumnsMap() {
    return new Map(this.filteredColumns.map((col) => [col.field, col]));
  }

  get columns() {
    return this.filteredColumns.map((column) => {
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
  handleFilterDrawerApply(selectedColumns: FilterColumn[]) {
    this.selectedColumns = selectedColumns;
    this.filterDrawerOpen = false;
  }

  previewReportRequest = task(async () => {
    const reportRequest = this.args.reportRequest;

    if (!reportRequest.isRelevant) {
      return;
    }

    try {
      this.reportPreview = await reportRequest.previewReport();
    } catch (error) {
      this.notify.error(this.intl.t('reportModule.errorPreviewingReport'));
    }
  });

  downloadReport = task(async () => {
    const reportRequest = this.args.reportRequest;

    try {
      const report = this.store.createRecord('ai-reporting/report', {
        reportRequest: reportRequest,
        columns: this.filteredColumns.map((col) => ({
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
