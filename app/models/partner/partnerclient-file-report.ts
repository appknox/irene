import Model, { attr } from '@ember-data/model';

export default class PartnerclientFileReportModel extends Model {
  @attr('string')
  declare language: string;

  @attr('number')
  declare progress: number;

  @attr('date')
  declare generatedOn: Date;

  @attr('number')
  declare file: number;

  get isGenerating(): boolean {
    return this.progress < 100;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partnerclient-file-report': PartnerclientFileReportModel;
  }
}
