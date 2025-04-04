import CommondrfNestedAdapter from './commondrf-nested';

export type TrackerRequestQuery = {
  fileId?: string;
};

export default class TrackerRequestAdapter extends CommondrfNestedAdapter {
  urlForQueryRecord(query: TrackerRequestQuery) {
    const { fileId } = query;

    delete query.fileId;

    return this.buildURLFromBase(
      `${this.namespace_v2}/files/${fileId}/tracker_request`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'tracker-request': TrackerRequestAdapter;
  }
}
