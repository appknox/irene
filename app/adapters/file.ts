import CommonDRFAdapter from './commondrf';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';
import type SbomFileModel from 'irene/models/sbom-file';
import type FileRiskModel from 'irene/models/file-risk';

import FileCapiReportModel, {
  type FileCapiReportScanType,
} from 'irene/models/file-capi-report';

export interface FileCapiReportsResponse {
  message: string;
  reports: FileCapiReportModel[];
  formats_requested: FileCapiReportScanType[];
}

interface ProjectFilesQuery {
  projectId: string;
}

export default class FileAdapter extends CommonDRFAdapter {
  _buildURL(_: string | number, id: string | number) {
    if (id) {
      const baseurl = `${this.namespace_v3}/files`;

      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
  }

  _buildNestedURL(modelName: string | number, projectId: string) {
    const filesURL = `${this.namespace}/projects/${projectId}/files`;

    return this.buildURLFromBase(filesURL);
  }

  _pushDirectlyToStore<T>(
    res: { [key: string]: string },
    modelName: string
  ): T | null {
    const modelId = res?.['id'];

    if (modelId) {
      const normalized = this.store.normalize(modelName, res);

      return this.store.push(normalized) as T;
    }

    return null;
  }

  urlForQuery(query: ProjectFilesQuery, modelName: string | number) {
    return this._buildNestedURL(modelName, query.projectId);
  }

  async getLastDynamicScan(
    fileId: string,
    mode: number,
    isScheduledScan: boolean
  ): Promise<DynamicscanModel | null> {
    let url = `${this._buildURL('file', fileId)}/dynamicscans?limit=1&mode=${mode}`;

    // TODO: update to use the namespace_v3 when the API has support for it
    url = url.replace(this.namespace_v3, this.namespace_v2);

    // Add scheduled scan filters
    if (isScheduledScan) {
      url = url.concat('&engine=2&group_status=running');
    }

    const res = await this.ajax(url, 'GET');

    if (res.results[0]) {
      const normailized = this.store.normalize('dynamicscan', res.results[0]);

      return this.store.push(normailized) as DynamicscanModel;
    }

    return null;
  }

  async generateCapiReports(
    fileId: string,
    fileTypes: FileCapiReportScanType[]
  ) {
    const baseURL = this._buildURL('file', fileId);
    let url = `${baseURL}/capi_reports`;

    // TODO: update to use the namespace_v3 when the API has support for it
    url = url.replace(this.namespace_v3, this.namespace_v2);

    return this.ajax(url, 'POST', {
      data: { formats: fileTypes },
      headers: this.headers,
    }) as Promise<FileCapiReportsResponse>;
  }

  async getGenerateReportStatus(fileId: string) {
    const url = `${this._buildURL('file', fileId)}/can_generate_report`;
    const res = await this.ajax(url, 'GET');

    return res as { can_generate_report: boolean };
  }

  async getFileLastManualDynamicScan(fileId: string) {
    const url = `${this._buildURL('file', fileId)}/last_manual_dynamic_scan`;
    const res = await this.ajax(url, 'GET');

    return this._pushDirectlyToStore<DynamicscanModel>(res, 'dynamicscan');
  }

  async getFileLastAutomatedDynamicScan(fileId: string) {
    const url = `${this._buildURL('file', fileId)}/last_automated_dynamic_scan`;
    const res = await this.ajax(url, 'GET');

    return this._pushDirectlyToStore<DynamicscanModel>(res, 'dynamicscan');
  }

  async fetchPreviousFile(fileId: string) {
    const url = `${this._buildURL('file', fileId)}/previous_file`;
    const res = await this.ajax(url, 'GET');

    return this._pushDirectlyToStore<FileModel>(res, 'file');
  }

  async getSbomFile(fileId: string) {
    const url = `${this._buildURL('file', fileId)}/sbom_file`;
    const res = await this.ajax(url, 'GET');

    return this._pushDirectlyToStore<SbomFileModel>(res, 'sbom-file');
  }

  async fetchFileRisk(fileId: string) {
    const url = `${this._buildURL('file', fileId)}/risk`;
    const res = await this.ajax(url, 'GET');

    if (res?.file) {
      const normalized = this.store.normalize('file-risk', res);

      return this.store.push(normalized) as FileRiskModel;
    }

    return null;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    file: FileAdapter;
  }
}
