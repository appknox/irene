import CommonDRFAdapter from './commondrf';

export default class PrivacyProjectAdapter extends CommonDRFAdapter {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace_v2}/privacy_project`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'privacy-project': PrivacyProjectAdapter;
  }
}
