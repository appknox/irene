import commondrf from './commondrf';
import Store, { Snapshot } from '@ember-data/store';
import ModelRegistry from 'ember-data/types/registries/model';
import { ModelSchema } from 'ember-data';

export default class OidcProviderAdapter extends commondrf {
  _buildURL() {
    const baseurl = `${this.namespace}/organizations/${this.organization.selected?.id}/sso/oidc`;

    return this.buildURLFromBase(baseurl);
  }

  createRecord<K extends keyof ModelRegistry>(
    store: Store,
    modelClass: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const attrs = snapshot.attributes();

    const data = {
      client_id: attrs?.['clientId'],
      client_secret: attrs?.['clientSecret'],
      discovery_url: attrs?.['discoveryUrl'],
    };

    const url = this._buildURL();

    return this.ajax(url, 'POST', { data });
  }
}
