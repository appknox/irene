/* eslint-disable ember/use-ember-data-rfc-395-imports */
import Store, { type Snapshot } from '@ember-data/store';
import type { ModelSchema } from 'ember-data';
import type ModelRegistry from 'ember-data/types/registries/model';
import commondrf from './commondrf';

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
