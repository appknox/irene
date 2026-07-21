/* eslint-disable ember/use-ember-data-rfc-395-imports */
import commondrf from './commondrf';
import Store from 'ember-data/store';
import type { ModelSchema } from 'ember-data';
import type { Snapshot } from '@ember-data/store';
import type ModelRegistry from 'ember-data/types/registries/model';
import type { FileReportScanType } from 'irene/models/file-report';

interface FileLegacyCvssReportQuery {
  fileId: string;
}

enum REPORT_TYPE_ENDPOINT {
  xlsx = 'summary_excel',
  csv = 'summary_csv',
  pdf = 'pdf',
}

export default class FileLegacyCvssReportAdapter extends commondrf {
  filesBaseUrl = this.buildURLFromBase(`${this.namespace_v2}/files`);
  legacyReportsBaseUrl = this.buildURLFromBase(
    `${this.namespace_v2}/legacy_cvss_reports`
  );

  _buildURL(modelName: string | number, fileId: number | string) {
    return `${this.filesBaseUrl}/${fileId}/legacy_cvss_reports`;
  }

  urlForQuery(q: FileLegacyCvssReportQuery) {
    return `${this.filesBaseUrl}/${q.fileId}/legacy_cvss_reports`;
  }

  createRecord<K extends keyof ModelRegistry>(
    store: Store,
    modelClass: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const url = this._buildURL(modelClass.modelName, snapshot.record.fileId);

    return this.ajax(url, 'POST', { data: {} });
  }

  urlForFindRecord(id: string | number) {
    return `${this.legacyReportsBaseUrl}/${id}`;
  }

  async getReportByType(
    modelName: string,
    reportId: string,
    type: FileReportScanType
  ) {
    const reportTypeEndpoint = REPORT_TYPE_ENDPOINT[type];
    const url = `${this.legacyReportsBaseUrl}/${reportId}/${reportTypeEndpoint}`;

    const response = await this.ajax(url, 'GET', {
      headers: this.headers,
    });

    return response as { url?: string };
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'file-legacy-cvss-report': FileLegacyCvssReportAdapter;
  }
}
