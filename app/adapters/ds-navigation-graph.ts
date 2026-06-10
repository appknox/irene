import CommondrfNestedAdapter from './commondrf-nested';

export default class DsNavigationGraphAdapter extends CommondrfNestedAdapter {
  setNestedUrlNamespace(dynamicscanId: string | number) {
    this.namespace = `${this.namespace_v2}/dynamicscans/${dynamicscanId}/navigation_graph`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'ds-navigation-graph': DsNavigationGraphAdapter;
  }
}
