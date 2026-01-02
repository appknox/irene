import CommonDRFAdapter from './commondrf';
import Store from 'ember-data/store';
import { Snapshot } from '@ember-data/store';
import ModelRegistry from 'ember-data/types/registries/model';

export interface PrivacyReportDownloadDetails {
  url: string;
}

export default class PrivacyReportAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/privacy_reports`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(query: { fileId?: string }) {
    const { fileId } = query;

    delete query.fileId;

    return this.buildURLFromBase(
      `${this.namespace_v2}/files/${fileId}/privacy_report`
    );
  }

  createRecord<K extends keyof ModelRegistry>(
    store: Store,
    modelClass: { modelName: string | number },
    snapshot: Snapshot<K>
  ) {
    const baseURL = `${this.namespace_v2}/files`;

    const url = this.buildURLFromBase(
      `${baseURL}/${encodeURIComponent(snapshot.record.fileId)}/privacy_report`
    );

    return this.ajax(url, 'POST', {});
  }

  _buildDownloadReportUrl(modelName: string | number, privacyReportId: string) {
    const baseURL = this._buildURL(modelName, privacyReportId);

    return `${baseURL}/pdf/download_url`;
  }

  _buildGenerateReportUrl(modelName: string | number, fileId: string) {
    const baseURL = this._buildURL(modelName, fileId);

    return `${baseURL}/pdf/generate`;
  }

  createPrivacyReport(modelName: string | number, privacyReportId: string) {
    const url = this._buildGenerateReportUrl(modelName, privacyReportId);

    return this.ajax(url, 'POST') as Promise<{ success: boolean }>;
  }

  generatePrivacyReport(modelName: string | number, privacyReportId: string) {
    const url = this._buildGenerateReportUrl(modelName, privacyReportId);

    return this.ajax(url, 'POST') as Promise<{ success: boolean }>;
  }

  fetchDownloadReportDetails(
    modelName: string | number,
    privacyReportId: string
  ) {
    const url = this._buildDownloadReportUrl(modelName, privacyReportId);

    return this.ajax(url, 'GET') as Promise<PrivacyReportDownloadDetails>;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'privacy-report': PrivacyReportAdapter;
  }
}
