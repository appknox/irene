import { SbomReportType } from 'irene/models/sbom-report';
import CommonDRFAdapter from './commondrf';

export interface SbomScanDownloadReportDetails {
  url: string;
}

export default class SbomReportAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/sb_reports`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery(query: { sbomFileId: string }) {
    const baseURL = `${this.namespace_v2}/sb_files`;

    return this.buildURLFromBase(
      `${baseURL}/${encodeURIComponent(query.sbomFileId)}/sb_reports`
    );
  }

  _buildDownloadReportUrl(
    modelName: string | number,
    sbomReportId: string,
    type: SbomReportType
  ) {
    const baseURL = this._buildURL(modelName, sbomReportId);

    return `${baseURL}/${type}/download_url`;
  }

  _buildGenerateReportUrl(
    modelName: string | number,
    sbomFileId: string,
    type: SbomReportType
  ) {
    const baseURL = this._buildURL(modelName, sbomFileId);

    return `${baseURL}/${type}/generate`;
  }

  generateScanReport(
    modelName: string | number,
    sbomReportId: string,
    type: SbomReportType
  ) {
    const url = this._buildGenerateReportUrl(modelName, sbomReportId, type);

    return this.ajax(url, 'POST') as Promise<{ success: boolean }>;
  }

  fetchDownloadReportDetails(
    modelName: string | number,
    sbomReportId: string,
    type: SbomReportType
  ) {
    const url = this._buildDownloadReportUrl(modelName, sbomReportId, type);

    return this.ajax(url, 'GET') as Promise<SbomScanDownloadReportDetails>;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sbom-report': SbomReportAdapter;
  }
}
