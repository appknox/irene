import { SbomScanReportType } from 'irene/models/sbom-scan-report';
import CommonDRFAdapter from './commondrf';

export interface SbomScanDownloadReportDetails {
  url: string;
}

export default class SbomScanReportAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sb_reports`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery(query: { sbomScanId: string }) {
    const baseURL = `${this.namespace_v2}/sb_files`;

    return this.buildURLFromBase(
      `${baseURL}/${encodeURIComponent(query.sbomScanId)}/sb_reports`
    );
  }

  _buildDownloadReportUrl(
    modelName: string | number,
    sbomScanReportId: string,
    type: SbomScanReportType
  ) {
    const baseURL = this._buildURL(modelName, sbomScanReportId);

    return `${baseURL}/${type}/download_url`;
  }

  _buildGenerateReportUrl(
    modelName: string | number,
    sbomScanId: string,
    type: SbomScanReportType
  ) {
    const baseURL = this._buildURL(modelName, sbomScanId);

    return `${baseURL}/${type}/generate`;
  }

  generateScanReport(
    modelName: string | number,
    sbomScanReportId: string,
    type: SbomScanReportType
  ) {
    const url = this._buildGenerateReportUrl(modelName, sbomScanReportId, type);

    return this.ajax(url, 'POST') as Promise<{ success: boolean }>;
  }

  fetchDownloadReportDetails(
    modelName: string | number,
    sbomScanReportId: string,
    type: SbomScanReportType
  ) {
    const url = this._buildDownloadReportUrl(modelName, sbomScanReportId, type);

    return this.ajax(url, 'GET') as Promise<SbomScanDownloadReportDetails>;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-scan-report': SbomScanReportAdapter;
  }
}
