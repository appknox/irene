import CommonDRFAdapter from './commondrf';

export interface StoreReleaseReadinessReportDownloadDetails {
  url: string;
}

export default class StoreReleaseReadinessReportAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/store-release-readiness/reports`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(query: { fileId?: string }) {
    const { fileId } = query;

    delete query.fileId;

    return this.buildURLFromBase(
      `${this.namespace_v2}/files/${fileId}/store_readiness_report`
    );
  }

  _buildDownloadReportUrl(modelName: string | number, reportId: string) {
    const baseURL = this._buildURL(modelName, reportId);

    return `${baseURL}/pdf/download_url`;
  }

  _buildGenerateReportUrl(modelName: string | number, reportId: string) {
    const baseURL = this._buildURL(modelName, reportId);

    return `${baseURL}/pdf/generate`;
  }

  generateReport(modelName: string | number, reportId: string) {
    const url = this._buildGenerateReportUrl(modelName, reportId);

    return this.ajax(url, 'POST') as Promise<{ success: boolean }>;
  }

  fetchDownloadReportDetails(modelName: string | number, reportId: string) {
    const url = this._buildDownloadReportUrl(modelName, reportId);

    return this.ajax(
      url,
      'GET'
    ) as Promise<StoreReleaseReadinessReportDownloadDetails>;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'store-release-readiness-report': StoreReleaseReadinessReportAdapter;
  }
}
