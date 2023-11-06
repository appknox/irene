import { Snapshot } from '@ember-data/store';
import commondrf from './commondrf';

export default class CapturedAPIAdapter extends commondrf {
  buildURL(
    modelName?: string | number,
    id?: string | number,
    snapshot?: Snapshot | null | unknown[],
    requestType?: string | undefined,
    query?: {
      fileId: string | number;
    }
  ) {
    if (id) {
      const baseurl = `${this.namespace}/capturedapis`;

      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    const baseurl = `${this.namespace_v2}/files/${query?.fileId}`;

    return this.buildURLFromBase(`${baseurl}/capturedapis`);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    capturedapi: CapturedAPIAdapter;
  }
}
