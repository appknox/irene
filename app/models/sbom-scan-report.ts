import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import SbomScanModel from './sbom-scan';

export type SbomScanReportType = 'cyclonedx_json_file' | 'pdf';

export enum SbomScanReportStatus {
  PENDING = 1,
  STARTED = 2,
  IN_PROGRESS = 3,
  COMPLETED = 4,
  FAILED = 5,
}

export default class SbomScanReportModel extends Model {
  @belongsTo('sbom-scan')
  declare sbFile: AsyncBelongsTo<SbomScanModel>;

  @attr('string')
  declare language: 'en' | 'ja';

  @attr('number')
  declare pdfProgress: number;

  @attr('number')
  declare pdfStatus: SbomScanReportStatus;

  @attr('string')
  declare reportPassword: string;

  @attr('date')
  declare generatedOn: Date | null;

  generateReport(type: SbomScanReportType) {
    const adapter = this.store.adapterFor('sbom-scan-report');

    return adapter.generateScanReport('sbom-scan-report', this.id, type);
  }

  downloadReport(type: SbomScanReportType) {
    const adapter = this.store.adapterFor('sbom-scan-report');

    return adapter.fetchDownloadReportDetails(
      'sbom-scan-report',
      this.id,
      type
    );
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-scan-report': SbomScanReportModel;
  }
}
