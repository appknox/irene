import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import SbomFileModel from './sbom-file';

export type SbomReportType = 'cyclonedx_json_file' | 'pdf';

// Distinguishes the underlying report record (what data it covers),
// as opposed to SbomReportType above (which file format to generate/download).
export type SbomReportCategory = 'sbom' | 'ai_bom';

export enum SbomReportStatus {
  PENDING = 1,
  STARTED = 2,
  IN_PROGRESS = 3,
  COMPLETED = 4,
  FAILED = 5,
}

export default class SbomReportModel extends Model {
  @belongsTo('sbom-file', { async: true, inverse: null })
  declare sbFile: AsyncBelongsTo<SbomFileModel> | null;

  @attr('string')
  declare language: 'en' | 'ja';

  @attr('number')
  declare pdfProgress: number;

  @attr('number')
  declare pdfStatus: SbomReportStatus;

  @attr('string')
  declare reportPassword: string;

  @attr('string')
  declare reportType: SbomReportCategory;

  @attr('date')
  declare generatedOn: Date | null;

  generateReport(type: SbomReportType) {
    const adapter = this.store.adapterFor('sbom-report');

    return adapter.generateScanReport('sbom-report', this.id, type);
  }

  downloadReport(type: SbomReportType) {
    const adapter = this.store.adapterFor('sbom-report');

    return adapter.fetchDownloadReportDetails('sbom-report', this.id, type);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-report': SbomReportModel;
  }
}
