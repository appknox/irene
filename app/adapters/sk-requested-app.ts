import CommonDRFAdapter from './commondrf';

export default class SkRequestedAppAdapter extends CommonDRFAdapter {
  namespace = this.namespace_v2;

  _buildURL() {
    const baseurl = `${this.namespace}/sk_requested_apps`;
    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'sk-requested-app': SkRequestedAppAdapter;
  }
}
