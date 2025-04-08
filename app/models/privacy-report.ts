import Model, { AsyncBelongsTo, belongsTo, attr } from '@ember-data/model';

import type FileModel from './file';
import type PrivacyProjectModel from './privacy-project';

export default class PrivacyReportModel extends Model {
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

  @attr('date')
  declare generatedOn: Date | null;

  @attr('number')
  declare privacyAnalysisStatus: number;

  @belongsTo('privacy-project', { async: true, inverse: null })
  declare privacyProject: AsyncBelongsTo<PrivacyProjectModel>;

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
