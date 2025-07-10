import commondrf from './commondrf';
import Store, { Snapshot } from '@ember-data/store';
import ModelRegistry from 'ember-data/types/registries/model';
import { ModelSchema } from '@ember-data';

export default class OidcProviderAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace}/v2/sso/oidc/providers/`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}${encodeURIComponent(id)}/`);
    }

    return this.buildURLFromBase(baseURL);
  }

  createRecord<K extends keyof ModelRegistry>(
    store: Store,
    modelClass: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    console.log(snapshot);

    const attrs = snapshot.attributes();

    const data = {
      client_id: attrs?.['clientId'],
      client_secret: attrs?.['clientSecret'],
      discovery_url: attrs?.['discoveryUrl'],
    };

    const url = this._buildURL(modelClass.modelName);

    return this.ajax(url, 'POST', { data });
  }

  deleteRecord<K extends keyof ModelRegistry>(
    store: Store,
    modelClass: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const id = snapshot.id;
    const url = this._buildURL(modelClass.modelName, id);
    return this.ajax(url, 'DELETE');
  }
}
