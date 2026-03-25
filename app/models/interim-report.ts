import Model, { AsyncBelongsTo, belongsTo, attr } from '@ember-data/model';

import type FileModel from './file';

export default class InterimReportModel extends Model {
  @belongsTo('file', { async: true, inverse: null })
  declare file: AsyncBelongsTo<FileModel>;

  @attr('string')
  declare language: 'en' | 'ja';

  @attr('number')
  declare pdfProgress: number;

  @attr('number')
  declare pdfStatus: number;

  @attr('string')
  declare reportPassword: string;

  @attr('string')
  declare generatedBy: string;

  @attr('date')
  declare createdOn: Date | null;

  @attr('number')
  declare interimAnalysisStatus: number;

  @attr('boolean')
  declare isVisibleToCustomer: boolean;

  get isGenerating() {
    return this.pdfProgress >= 0 && this.pdfProgress <= 99;
  }

  get isGenerated() {
    return this.pdfProgress === 100;
  }

  generateReport() {
    const adapter = this.store.adapterFor('interim-report');

    return adapter.generateInterimReport(this.id);
  }

  downloadReport() {
    const adapter = this.store.adapterFor('interim-report');

    return adapter.fetchDownloadReportDetails(this.id);
  }

  toggleCustomerVisibility(isVisibleToCustomer: boolean) {
    const adapter = this.store.adapterFor('interim-report');

    return adapter.toggleCustomerVisibility(this.id, isVisibleToCustomer);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'interim-report': InterimReportModel;
  }
}
