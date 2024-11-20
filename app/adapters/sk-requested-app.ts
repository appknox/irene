import CommonDRFAdapter from './commondrf';

export default class SkRequestedAppAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseurl = `${this.namespace_v2}/sk_requested_apps`;

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-requested-app': SkRequestedAppAdapter;
  }
}
