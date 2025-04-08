import CommondrfNestedAdapter from './commondrf-nested';

export type TrackerRequestQuery = {
  fileId?: string;
};

export default class TrackerRequestAdapter extends CommondrfNestedAdapter {
  _buildURL() {
    return this.buildURLFromBase(`${this.namespace}/tracker_request`);
  }

  setNestedUrlNamespace(fileId: string) {
    this.namespace = `${this.namespace_v2}/files/${fileId}`;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'tracker-request': TrackerRequestAdapter;
  }
}
