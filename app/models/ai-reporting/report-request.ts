import Model, { attr } from '@ember-data/model';

// Advanced Filter types
export interface AdditionalFilterErroredFieldProp {
  field: boolean;
  operator: boolean;
}

export type AdditionalFilterFilterDetailsExpressionValues =
  | string
  | number
  | boolean
  | number[]
  | string[]
  | Date
  | Date[]
  | null;

export type AdditionalFilterFilterDetailsExpression = {
  operator: string;
  filterMetaInfo?: PreviewFilterField;
  value:
    | AdditionalFilterFilterDetailsExpressionValues
    | AdditionalFilterFilterDetailsExpressionValues[];
};

export interface AdditionalFilter {
  id: string;
  filter_details: Record<string, AdditionalFilterFilterDetailsExpression>;
}

export interface DownloadUrlPayload {
  additional_filters?: AdditionalFilter[];
  title?: string;
  columns?: { label: string; field: string }[];
  report_type?: 'csv' | 'xlsx';
}

// Report Preview types
export interface ReportPreviewData {
  [key: string]: unknown;
}

export interface ReportPreviewColumn {
  field: string;
  label: string;
  type: string;
  is_default: boolean;
}

export interface ReportPreviewPagination {
  count: number;
  offset: number;
  limit: number;
}

export interface PreviewFilterField {
  field: string;
  filter_key: string;
  label: string;
  type: string;
  choices?: [string, string | number | boolean][];
  is_nullable: boolean;
  range?: boolean;
}

export interface PreviewFilterDetails {
  id: string;
  model_name: string;
  has_filters: boolean;
  fields: PreviewFilterField[];
}

export interface ReportRequestPreview {
  title: string;
  columns: ReportPreviewColumn[];
  data: ReportPreviewData[];
  pagination: ReportPreviewPagination;
  filter_details: PreviewFilterDetails[];
}

export enum ReportRequestStatus {
  PENDING = 0,
  PROCESSING = 1,
  COMPLETED = 2,
  FAILED = 3,
}

export interface FilterColumn {
  name: string;
  field: string;
  selected: boolean;
  order: number;
  default?: boolean;
  type?: string;
}

export default class AiReportingReportRequestModel extends Model {
  @attr('string')
  declare query: string;

  @attr('boolean', { defaultValue: false })
  declare isRelevant: boolean;

  @attr('string')
  declare reportType: string;

  @attr('number')
  declare status: ReportRequestStatus;

  @attr('boolean')
  declare error: boolean;

  @attr('string')
  declare errorMessage: string;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  async previewReport(
    limit: number,
    offset: number,
    additionalFilters?: AdditionalFilter[],
    columns?: { label: string; field: string }[]
  ) {
    const adapter = this.store.adapterFor('ai-reporting/report-request');

    return await adapter.previewReport(
      this.id,
      limit,
      offset,
      additionalFilters,
      columns
    );
  }

  async downloadUrl(payload: DownloadUrlPayload) {
    const adapter = this.store.adapterFor('ai-reporting/report-request');

    return await adapter.downloadUrl(this.id, payload);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'ai-reporting/report-request': AiReportingReportRequestModel;
  }
}
