import commondrf from '../commondrf';

export default class PartnerclientProjectAdapter extends commondrf {
  _buildUrl(endpoint: string) {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partnerclients${endpoint}`
    );
  }

  urlForQuery(q: { clientId: string | number | undefined }) {
    const clientId = q.clientId;
    q.clientId = undefined;

    return this._buildUrl(`/${clientId}/projects`);
  }

  urlForQueryRecord(q: {
    clientId: string | number | undefined;
    projectId: string | number | undefined;
  }) {
    const clientId = q.clientId;
    const projectId = q.projectId;

    q.clientId = undefined;
    q.projectId = undefined;

    return this._buildUrl(`/${clientId}/projects/${projectId}`);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/partnerclient-project': PartnerclientProjectAdapter;
  }
}
