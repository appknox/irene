import { action } from '@ember/object';
import Component from '@glimmer/component';
import type { ReportRequestPreview } from 'irene/models/report-request';
import type { FilterColumn } from 'irene/services/ai-reporting';

interface AiReportingPreviewTableSignature {
  Args: {
    limit: number;
    offset: number;
    isFetchingReportPreview: boolean;
    reportPreview: ReportRequestPreview | null;
    selectedColumns: FilterColumn[];
    errorScreenHeader: string;
    errorScreenDesc: string;
    refetchPreviewRequest: (limit: number, offset: number) => void;
  };
}

export default class AiReportingPreviewTableComponent extends Component<AiReportingPreviewTableSignature> {
  get reportPreview() {
    return this.args.reportPreview;
  }

  get columns() {
    return this.args.selectedColumns.map((column) => {
      return {
        name: column.name,
        val_field: column.field,
        field_type: column.type,
        component: 'ai-reporting/preview/column-value',
      };
    });
  }

  get totalRows() {
    return this.reportPreview?.pagination.count || 0;
  }

  get rows() {
    return this.reportPreview?.data || [];
  }

  get hasPreviewData() {
    return this.rows.length > 0;
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.args.refetchPreviewRequest(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.args.refetchPreviewRequest(limit, 0);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::Table': typeof AiReportingPreviewTableComponent;
  }
}
