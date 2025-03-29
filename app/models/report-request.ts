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

  async previewReport() {
    const adapter = this.store.adapterFor('report-request');

    return await adapter.previewReport(this.id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'report-request': ReportRequestModel;
  }
}
