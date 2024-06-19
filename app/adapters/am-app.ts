/* eslint-disable ember/use-ember-data-rfc-395-imports */
import ModelRegistry from 'ember-data/types/registries/model';
import commondrf from './commondrf';
import Store, { Snapshot } from '@ember-data/store';
import { ModelSchema } from 'ember-data';

export default class AmAppAdapter extends commondrf {
  _buildURL(_: string | number, id: string | number) {
    const baseurl = `${this.namespace_v2}/am_apps`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  updateRecord<K extends keyof ModelRegistry>(
    store: Store,
    type: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const data = {};
    // @ts-expect-error to be fixed
    const serializer = store.serializerFor(type.modelName);

    // @ts-expect-error to be fixed
    serializer.serializeIntoHash(data, type, snapshot);

    const id = snapshot.id;
    const url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, 'PATCH', { data });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'am-app': AmAppAdapter;
  }
}
