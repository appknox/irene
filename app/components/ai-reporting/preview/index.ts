import { service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type ReportRequestModel from 'irene/models/ai-reporting/report-request';

import type {
  AdditionalFilter,
  FilterColumn,
} from 'irene/models/ai-reporting/report-request';

import type IreneAjaxService from 'irene/services/ajax';

import type {
  ReportRequestPreview,
  PreviewFilterDetails,
} from 'irene/models/ai-reporting/report-request';

interface AiReportingPreviewSignature {
  Args: { reportRequest: ReportRequestModel };
}

export default class AiReportingPreview extends Component<AiReportingPreviewSignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked reportPreview: null | ReportRequestPreview = null;
  @tracked filterDetails: PreviewFilterDetails[] = [];
  @tracked filterByColumnDrawerOpen = false;
  @tracked advanceFilterDrawerOpen = false;
  @tracked limit = 10;
  @tracked offset = 0;

  @tracked allColumnsMap: Map<string, FilterColumn> = new Map();
  @tracked additionalFilters: AdditionalFilter[] = [];
  @tracked errorScreenHeader: string = '';
  @tracked errorScreenDesc: string = '';

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

  get noSelectedColumns() {
    return this.selectedColumns.length;
  }

  get noSelectedAdvancedFilters() {
    return this.additionalFilters.reduce((acc, curr) => {
      return acc + Object.keys(curr.filter_details).length;
    }, 0);
  }

  get hasDefaultFilters(): boolean {
    return this.filterDetails.some((detail) => detail.has_filters);
  }

  get title() {
    return this.reportPreview?.title || '';
  }

  get disableFilters() {
    return !this.args.reportRequest.isRelevant || !this.reportPreview;
  }

  get disableDownload() {
    return this.disableFilters || this.reportPreview?.data.length === 0;
  }

  get disableAdvanceFilterButton() {
    return (
      this.previewReportRequest.isRunning || !this.args.reportRequest.isRelevant
    );
  }

  get hasAdvancedFilters() {
    return this.filterDetails.length > 0;
  }

  get showAdvanceFilterDrawer() {
    return this.hasAdvancedFilters && this.advanceFilterDrawerOpen;
  }

  @action
  handleFilterByColumnDrawerOpen() {
    this.filterByColumnDrawerOpen = true;
  }

  @action
  handleAdvanceFilterDrawerOpen() {
    this.advanceFilterDrawerOpen = true;
  }

  @action
  handleFilterByColumnDrawerClose() {
    this.filterByColumnDrawerOpen = false;
  }

  @action
  handleAdvanceFilterDrawerClose() {
    this.advanceFilterDrawerOpen = false;
  }

  @action
  handleRefetchPreviewRequest(limit: number, offset: number) {
    this.limit = limit;
    this.offset = offset;

    this.previewReportRequest.perform(false, limit, offset);
  }

  @action
  handleFilterByColumnDrawerApply(allColumnsMap: Map<string, FilterColumn>) {
    this.allColumnsMap = allColumnsMap;

    this.previewReportRequest.perform(false, this.limit, 0);
  }

  @action
  handleAdvanceFilterDrawerApply(additionalFilters: AdditionalFilter[] = []) {
    // Do not run preview request if no filters are applied and updated filters are empty
    if (additionalFilters.length === 0 && this.additionalFilters.length === 0) {
      return;
    }

    this.offset = 0;
    this.additionalFilters = additionalFilters;

    this.previewReportRequest.perform(false, this.limit, 0);
  }

  setPreviewErrors(headerKey: string, descKey: string, translate = true) {
    this.errorScreenHeader = translate ? this.intl.t(headerKey) : headerKey;
    this.errorScreenDesc = translate ? this.intl.t(descKey) : descKey;
  }

  checkReportReqRelevancy(reportRequest: ReportRequestModel) {
    if (reportRequest.isRelevant) {
      return true;
    }

    const errorType = reportRequest.error
      ? 'somethingWentWrong'
      : 'rephrasingError';

    this.setPreviewErrors(
      `reportModule.${errorType}Header`,
      `reportModule.${errorType}Desc`
    );

    return false;
  }

  processColumnsAndFilters() {
    const columns = this.reportPreview?.columns || [];
    let hasSelectedColumns = false;

    this.allColumnsMap = new Map(
      columns.map((column, index) => {
        const isSelected = !!column.is_default;

        if (isSelected) {
          hasSelectedColumns = true;
        }

        return [
          column.field,
          {
            name: column.label,
            field: column.field,
            type: column.type,
            selected: isSelected,
            order: index,
            default: isSelected,
          },
        ];
      })
    );

    if (!hasSelectedColumns) {
      this.setPreviewErrors(
        'reportModule.noSelectedColumnsHeader',
        'reportModule.noSelectedColumnsDesc'
      );
    }

    this.filterDetails = this.reportPreview?.filter_details || [];
  }

  previewReportRequest = task(
    async (computeFiltersAndColumns = true, limit = 10, offset = 0) => {
      const reportRequest = this.args.reportRequest;

      if (!this.checkReportReqRelevancy(reportRequest)) {
        return;
      }

      try {
        this.reportPreview = await reportRequest.previewReport(
          limit,
          offset,
          this.additionalFilters,
          this.selectedColumns.map((column) => ({
            field: column.field,
            label: column.name,
          }))
        );

        if (this.reportPreview?.data.length === 0) {
          this.setPreviewErrors('noResultsFound', 'reportModule.noResultDesc');
        }

        if (computeFiltersAndColumns) {
          this.processColumnsAndFilters();
        }
      } catch (err) {
        const error = err as AdapterError;
        let errMsg = this.intl.t('pleaseTryAgain');

        if (error.errors && error.errors[0]?.detail) {
          const payload = JSON.parse(error.errors[0].detail);
          errMsg = payload.message || errMsg;
        }

        this.setPreviewErrors(
          this.intl.t('reportModule.failedToPreview'),
          errMsg,
          false
        );
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview': typeof AiReportingPreview;
  }
}
