import Model, { attr } from '@ember-data/model';

export interface ReportPreviewData {
  [key: string]: any;
}

export interface ReportPreviewColumn {
  field: string;
  label: string;
}

export interface ReportRequestPreview {
  title: string;
  columns: ReportPreviewColumn[];
  data: ReportPreviewData[];
}

export interface PreviewFilterField {
  field: string;
  label: string;
  type: string;
  choices?: [string, string | number | boolean][];
}

export interface PreviewFilterDetails {
  id: string;
  model_name: string;
  has_filters: boolean;
  fields: PreviewFilterField[];
}

export interface AdditionalFilter {
  id: string;
  filter_details: Record<
    string,
    { operator: string; value: string | number | boolean | null }
  >;
}

export enum ReportRequestStatus {
  PENDING = 0,
  PROCESSING = 1,
  COMPLETED = 2,
  FAILED = 3,
}

export default class ReportRequestModel extends Model {
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

  async previewReport(additionalFilters?: AdditionalFilter[]) {
    const adapter = this.store.adapterFor('report-request');

    return await adapter.previewReport(this.id, additionalFilters);
  }

  async filterDetails() {
    const adapter = this.store.adapterFor('report-request');

    return await adapter.filterDetails(this.id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'report-request': ReportRequestModel;
  }
}
