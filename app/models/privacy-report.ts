import Model, { attr } from '@ember-data/model';

export enum PrivacyReportStatus {
  PENDING = 1,
  STARTED = 2,
  IN_PROGRESS = 3,
  COMPLETED = 4,
  FAILED = 5,
}

export default class PrivacyReportModel extends Model {
  @attr('number')
  declare file: number;

  @attr('string')
  declare language: 'en' | 'ja';

  @attr('number')
  declare pdfProgress: number;

  @attr('number')
  declare pdfStatus: PrivacyReportStatus;

  @attr('string')
  declare reportPassword: string;

  @attr('date')
  declare generatedOn: Date | null;

  generateReport() {
    const adapter = this.store.adapterFor('privacy-report');

    return adapter.generatePrivacyReport('privacy-report', this.id);
  }

  downloadReport() {
    const adapter = this.store.adapterFor('privacy-report');

    return adapter.fetchDownloadReportDetails('privacy-report', this.id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'privacy-report': PrivacyReportModel;
  }
}
