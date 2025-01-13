import CommonDRFAdapter from './commondrf';
import type DynamicscanModel from 'irene/models/dynamicscan';

interface ProjectFilesQuery {
  projectId: string;
}

export default class File extends CommonDRFAdapter {
  _buildURL(_: string | number, id: string | number) {
    if (id) {
      const baseurl = `${this.namespace_v2}/files`;

      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
  }

  _buildNestedURL(modelName: string | number, projectId: string) {
    const filesURL = `${this.namespace}/projects/${projectId}/files`;

    return this.buildURLFromBase(filesURL);
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
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    file: File;
  }
}
