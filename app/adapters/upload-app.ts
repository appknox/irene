import Store, { Snapshot } from '@ember-data/store';
import commondrf from './commondrf';
import { underscore } from '@ember/string';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import ModelRegistry from 'ember-data/types/registries/model';

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
    // @ts-expect-error to be fixed
    const serializer = store.serializerFor(type.modelName);

    // @ts-expect-error to be fixed
    serializer.serializeIntoHash(data, type, snapshot);

    const id = snapshot.id;
    const url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, 'POST', {
      data: data,
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'upload-app': UploadAppAdapter;
  }
}
