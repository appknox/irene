import CommonDRFAdapter from './commondrf';

/** Detail: `GET …/store-release-readiness/findings/:id/`. */
export default class StoreReleaseReadinessFindingAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/store-release-readiness/findings`;

    if (id !== undefined && id !== null && id !== '') {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}/`);
    }

    return this.buildURLFromBase(`${baseURL}/`);
  }

  async overrideFinding(id: string | number, comment: string) {
    const url = `${this.buildURL('store-release-readiness-finding', id)}override/`;
    await this.ajax(url, 'PUT', {
      data: {
        comment,
      },
    });

    return this.store.findRecord('store-release-readiness-finding', id, {
      reload: true,
    });
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'store-release-readiness-finding': StoreReleaseReadinessFindingAdapter;
  }
}
