/* eslint-disable ember/use-ember-data-rfc-395-imports */
import { ModelSchema } from 'ember-data';
import commondrf from './commondrf';
import Store, { Snapshot } from '@ember-data/store';
import ModelRegistry from 'ember-data/types/registries/model';
import { FileReportScanType } from 'irene/models/file-report';

interface FileReportQuery {
  fileId: string;
}

enum REPORT_TYPE_ENDPOINT {
  xlsx = 'summary_excel',
  csv = 'summary_csv',
  pdf = 'pdf',
}

export default class FileReport extends commondrf {
  filesBaseUrl = this.buildURLFromBase(`${this.namespace_v2}/files`);
  reportsBaseUrl = this.buildURLFromBase(`${this.namespace_v2}/reports`);

  _buildURL(modelName: string | number, fileId: number | string) {
    return `${this.filesBaseUrl}/${fileId}/reports`;
  }

  urlForQuery(q: FileReportQuery) {
    return `${this.filesBaseUrl}/${q.fileId}/reports`;
  }

  createRecord<K extends keyof ModelRegistry>(
    store: Store,
    modelClass: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const url = this._buildURL(modelClass.modelName, snapshot.record.fileId);
    return this.ajax(url, 'POST', {
      data: {},
    });
  }

  urlForFindRecord(id: string | number) {
    return `${this.reportsBaseUrl}/${id}`;
  }

  async getReportByType(
    modelName: string,
    reportId: string,
    type: FileReportScanType
  ) {
    const reportTypeEndpoint = REPORT_TYPE_ENDPOINT[type];
    const url = `${this.reportsBaseUrl}/${reportId}/${reportTypeEndpoint}`;

    const response = await this.ajax(url, 'GET', {
      headers: this.headers,
    });

    return response as { url?: string };
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'file-report': FileReport;
  }
}
