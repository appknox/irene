import CommondrfNestedAdapter from './commondrf-nested';

export default class DsNavigationGraphAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/navigation_graph`);
  }

  setNestedUrlNamespace(dynamicscanId: string | number) {
    this.namespace = `${this.namespace_v2}/dynamicscans/${dynamicscanId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'ds-navigation-graph': DsNavigationGraphAdapter;
  }
}
