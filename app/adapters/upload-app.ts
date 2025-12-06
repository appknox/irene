import Store, { Snapshot } from '@ember-data/store';
import commondrf from './commondrf';
import { underscore } from '@ember/string';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import ModelRegistry from 'ember-data/types/registries/model';
import AdapterError from '@ember-data/adapter/error';

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

  handleResponse(
    status: number,
    headers: Record<string, unknown>,
    payload: Record<string, unknown>,
    requestData: Record<string, unknown>
  ) {
    // Intercept 429 rate limit
    if (status === 429) {
      return new AdapterError([
        {
          status,
          title: 'Rate Limit Exceeded',
          detail: payload?.['detail'] ?? 'Too many requests',
          code: payload?.['code'] ?? 'RATE_LIMIT_EXCEEDED',
          meta: {
            lock_time: payload?.['lock_time'],
          },
        },
      ] as any);
    }

    // otherwise fall back to original behavior
    return super.handleResponse(status, headers, payload, requestData);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'upload-app': UploadAppAdapter;
  }
}
