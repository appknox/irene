/* eslint-disable ember/use-ember-data-rfc-395-imports */
import ModelRegistry from 'ember-data/types/registries/model';
import commondrf from '../commondrf';

export default class PartnerclientFileAdapter extends commondrf {
  _buildNestedURL(
    _modelName: string | number,
    clientId: string | number,
    id: string | number
  ) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/files/${id}`;

    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(
    query: { clientId: string | number; id: string | number },
    modelName: string | number
  ) {
    return this._buildNestedURL(modelName, query.clientId, query.id);
  }

  urlForCreateReport(
    query: { clientId: string | number; id: string | number },
    modelName: string | number
  ) {
    const baseURL = this.urlForQueryRecord(query, modelName);

    return [baseURL, 'reports'].join('/');
  }

  createReport(
    modelName: keyof ModelRegistry,
    clientId: string | number,
    id: string | number,
    data: object
  ) {
    const url = this.urlForCreateReport(
      {
        clientId,
        id,
      },
      modelName
    );

    return this.ajax(url, 'POST', {
      data,
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'partner/partnerclient-file': PartnerclientFileAdapter;
  }
}
