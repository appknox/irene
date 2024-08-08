import CommonDRFAdapter from './commondrf';

type ProjectQueryParamOption = Record<string, string | number> & {
  adapterOptions?: {
    baseUrlModel: 'service-account';
    id?: string | number;
    path: string;
  };
};

export default class ProjectAdapter extends CommonDRFAdapter {
  _buildURL(modelName: string | number, id?: string | number) {
    const baseurl = `${this.namespace_v2}/projects`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization?.selected?.id}/projects`
    );
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
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    project: ProjectAdapter;
  }
}
