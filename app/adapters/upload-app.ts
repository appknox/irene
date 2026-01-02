import ModelRegistry from 'ember-data/types/registries/model';
import { underscore } from '@ember/string';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { ModelSchema } from 'ember-data';
import type Store from 'ember-data/store';
import type { Snapshot } from '@ember-data/store';

import commondrf from './commondrf';

export default class UploadAppAdapter extends commondrf {
  pathForType(type: keyof ModelRegistry) {
    return underscore(type.toString());
  }

  urlForQueryRecord(query: object | null, modelName: string | number) {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${
        this.organization.selected?.id
      }/${this.pathForType(modelName)}`
    );
  }

  urlForUpdateRecord(id: string | number, modelName: string | number) {
    return this.urlForQueryRecord(null, modelName);
  }

  updateRecord(
    store: Store,
    type: { modelName: string | number },
    snapshot: Snapshot
  ) {
    const data = {};

    const modelName = type.modelName as 'upload-app';
    const serializer = store.serializerFor(modelName);

    serializer.serializeIntoHash(
      data,
      type as ModelSchema<keyof ModelRegistry>,
      snapshot
    );

    const id = snapshot.id;
    const url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, 'POST', { data });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'upload-app': UploadAppAdapter;
  }
}
