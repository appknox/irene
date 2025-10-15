import CommonDRFAdapter from './commondrf';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';
import type SbomFileModel from 'irene/models/sbom-file';
import AnalysisModel from 'irene/models/analysis';

interface ProjectFilesQuery {
  projectId: string;
}

type GetAllAnalysesResponse = Array<{
  id: number;
  file: number;
  risk: number;
  computed_risk: number;
  status: number;
  overridden_risk: number | null;
  vulnerability: number;
  created_on: string;
  updated_on: string;
}>;

export default class File extends CommonDRFAdapter {
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

  _pushDirectlyToStore<T>(res: { id: string }, modelName: string): T | null {
    if (res?.id) {
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

  async loadAllAnalyses(fileId: string) {
    const url = `${this._buildURL('file', fileId)}/analyses`;
    const res = (await this.ajax(url, 'GET')) as GetAllAnalysesResponse;

    // Push the analyses to the store and map relation ships
    const normalizedData = res.map((analysis) => ({
      id: String(analysis.id),
      type: 'analysis',
      attributes: {
        risk: analysis.risk,
        computedRisk: analysis.computed_risk,
        status: analysis.status,
        overriddenRisk: analysis.overridden_risk,
        createdOn: new Date(analysis.created_on),
        updatedOn: new Date(analysis.updated_on),
      },
      relationships: {
        file: { data: { id: String(analysis.file), type: 'file' } },
        vulnerability: {
          data: { id: String(analysis.vulnerability), type: 'vulnerability' },
        },
      },
    }));

    const analyses = this.store.push({
      data: normalizedData,
    }) as AnalysisModel[];

    this.store.push({
      data: {
        id: fileId,
        type: 'file',
        relationships: {
          analyses: {
            data: res.map((analysis) => ({
              id: String(analysis.id),
              type: 'analysis',
            })),
          },
        },
      },
    });

    return analyses;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    file: File;
  }
}
