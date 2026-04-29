import Model, { attr } from '@ember-data/model';

export default class StoreReleaseReadinessReportModel extends Model {
  @attr('string')
  declare language: 'en' | 'ja';

  @attr('number')
  declare pdfProgress: number;

  @attr('number')
  declare pdfStatus: number;

  @attr('string')
  declare reportPassword: string;

  @attr('date')
  declare generatedOn: Date | null;

  @attr('boolean')
  declare refreshAvailable: boolean;

  generateReport() {
    const adapter = this.store.adapterFor('store-release-readiness-report');

    return adapter.generateReport('store-release-readiness-report', this.id);
  }

  downloadReport() {
    const adapter = this.store.adapterFor('store-release-readiness-report');

    return adapter.fetchDownloadReportDetails(
      'store-release-readiness-report',
      this.id
    );
  }

  async getGenerateReportStatus() {
    const adapter = this.store.adapterFor('file');

    return await adapter.getGenerateReportStatus(this.id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'store-release-readiness-report': StoreReleaseReadinessReportModel;
  }
}
