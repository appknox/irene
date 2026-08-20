import ModelRegistry from 'ember-data/types/registries/model';
import { underscore } from '@ember/string';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { ModelSchema } from 'ember-data';
import type Store from 'ember-data/store';
import type { Snapshot } from '@ember-data/store';

import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import commondrf from './commondrf';

export default class UploadAppAdapter extends commondrf {
  @service declare router: RouterService;
  pathForType(type: keyof ModelRegistry) {
    return underscore(type.toString());
  }

  getIsOffsec(queryOrSnapshot?: object | Snapshot | null) {
    if (!queryOrSnapshot) {
      return Boolean(
        this.router.currentRouteName?.includes('offensive-security')
      );
    }
    const fromAdapterOptions = (
      (queryOrSnapshot as Snapshot).adapterOptions as { offsec?: boolean }
    )?.offsec;
    const fromQuery = (queryOrSnapshot as { offsec?: boolean }).offsec;

    return Boolean(
      fromAdapterOptions ||
        fromQuery ||
        this.router.currentRouteName?.includes('offensive-security')
    );
  }

  urlForQueryRecord(
    query: (object & { offsec?: boolean }) | null,
    modelName: string | number
  ) {
    const isOffsec = this.getIsOffsec(query);
    const path = isOffsec ? 'offsec/upload_app' : this.pathForType(modelName);

    return this.buildURLFromBase(
      `${this.namespace}/organizations/${
        this.organization.selected?.id
      }/${path}`
    );
  }

  urlForUpdateRecord(
    id: string | number,
    modelName: string | number,
    snapshot?: Snapshot
  ) {
    const isOffsec = this.getIsOffsec(snapshot);
    const path = isOffsec ? 'offsec/upload_app' : this.pathForType(modelName);

    return this.buildURLFromBase(
      `${this.namespace}/organizations/${
        this.organization.selected?.id
      }/${path}`
    );
  }

  urlForCreateRecord(modelName: string | number, snapshot?: Snapshot) {
    return this.urlForUpdateRecord('', modelName, snapshot);
  }

  createRecord(
    store: Store,
    type: { modelName: string | number },
    snapshot: Snapshot
  ) {
    return this.updateRecord(store, type, snapshot);
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

    const url = this.buildURL(
      type.modelName,
      snapshot.id,
      snapshot,
      'updateRecord'
    );

    return this.ajax(url, 'POST', { data });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'upload-app': UploadAppAdapter;
  }
}
