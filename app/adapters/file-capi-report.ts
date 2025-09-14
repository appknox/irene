import commondrf from './commondrf';
import type { FileCapiReportScanType } from 'irene/models/file-capi-report';

interface FileCapiReportQuery {
  fileId?: string;
  fileType?: FileCapiReportScanType;
  latest?: boolean;
}

export default class FileCapiReport extends commondrf {
  filesBaseUrl = this.buildURLFromBase(`${this.namespace_v2}/files`);

  capiReportsBaseUrl = this.buildURLFromBase(
    `${this.namespace_v2}/capi_reports`
  );

  _buildURL(_modelName: string | number, fileId: number | string) {
    return `${this.filesBaseUrl}/${fileId}/capi_reports`;
  }

  urlForQuery(q: FileCapiReportQuery) {
    const fileId = q.fileId;

    delete q.fileId;

    return `${this.filesBaseUrl}/${fileId}/capi_reports`;
  }

  urlForFindRecord(id: string | number) {
    return `${this.capiReportsBaseUrl}/${id}`;
  }

  async downloadReport(reportId: string) {
    const url = `${this.capiReportsBaseUrl}/${reportId}/download`;

    const response = await this.ajax(url, 'GET', {
      headers: this.headers,
    });

    return response as { url?: string };
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'file-capi-report': FileCapiReport;
  }
}
