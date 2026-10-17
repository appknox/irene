import CommonDRFAdapter from './commondrf';

import type ProjectModel from 'irene/models/project';

export interface ProjectOverdueVulnerabilitiesCount {
  count: number;
}

type ProjectQueryParamOption = Record<string, string | number> & {
  adapterOptions?: {
    baseUrlModel: 'service-account';
    id?: string | number;
    path: string;
  };
};

export default class ProjectAdapter extends CommonDRFAdapter {
  _buildURL(modelName: string | number, id?: string | number) {
    const baseurl = `${this.namespace_v3}/projects`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  urlForQuery<k extends string | number>(
    query: ProjectQueryParamOption,
    modelName: k
  ): string {
    if (query.adapterOptions?.baseUrlModel) {
      const { baseUrlModel, id, path } = query.adapterOptions;
      const adapter = this.store.adapterFor(baseUrlModel);

      // not required to be part of url endpoint
      delete query.adapterOptions;

      return adapter.buildURL(baseUrlModel, id).concat(`/${path}`);
    }

    return this._buildURL(modelName, query['id']);
  }

  getOverdueVulnerabilitiesCount(
    modelInstance: ProjectModel
  ): Promise<ProjectOverdueVulnerabilitiesCount> {
    const url =
      this._buildURL('project', modelInstance.id) +
      '/overdue_vulnerabilities_count';

    return this.ajax(url, 'GET');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    project: ProjectAdapter;
  }
}
