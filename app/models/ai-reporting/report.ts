import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type { AdditionalFilter } from 'irene/models/ai-reporting/report-request';
import type AiReportingReportRequestModel from 'irene/models/ai-reporting/report-request';

export interface ReportColumn {
  label: string;
  field: string;
}

export default class AiReportingReportModel extends Model {
  @belongsTo('ai-reporting/report-request', {
    async: true,
    inverse: null,
  })
  declare reportRequest: AsyncBelongsTo<AiReportingReportRequestModel>;

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
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'ai-reporting/report': AiReportingReportModel;
  }
}
