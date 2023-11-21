import commondrf from '../commondrf';

export default class PartnerclientProjectFileAdapter extends commondrf {
  _buildNestedURL(
    _modelName: string | number,
    clientId: string | number | undefined,
    projectId: string | number | undefined
  ) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/projects/${projectId}/files`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQuery(
    query: {
      clientId: string | number | undefined;
      projectId: string | number | undefined;
    },
    modelName: string | number
  ) {
    const clientId = query.clientId;
    const projectId = query.projectId;

    query.clientId = undefined;
    query.projectId = undefined;

    return this._buildNestedURL(modelName, clientId, projectId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/partnerclient-project-file': PartnerclientProjectFileAdapter;
  }
}
