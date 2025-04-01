import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type { AdditionalFilter } from 'irene/models/report-request';

import type ReportRequestModel from '../report-request';

export interface ReportColumn {
  label: string;
  field: string;
}

export default class AiReportingReportModel extends Model {
  @belongsTo('report-request', { async: true, inverse: null })
  declare reportRequest: AsyncBelongsTo<ReportRequestModel>;

  @attr('string')
  declare title: string;

  @attr()
  declare columns: ReportColumn[];

  @attr('string')
  declare type: string;

  @attr('number')
  declare status: number;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @attr()
  declare filters: AdditionalFilter[];

  async downloadUrl() {
    const adapter = this.store.adapterFor('ai-reporting/report');

    return await adapter.downloadUrl(this.id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'ai-reporting/report': AiReportingReportModel;
  }
}
