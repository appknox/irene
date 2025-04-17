import CommonDRFAdapter from './commondrf';

export type TrackerDataQuery = {
  fileId?: string;
  trackerId?: string;
};

export default class TrackersAdapter extends CommonDRFAdapter {
  _buildNestedURL(
    modelName: string | number,
    fileId?: string,
    trackerId?: string
  ) {
    const filesURL = `${this.namespace_v2}/tracker_request/${trackerId}/tracker_data`;

    return this.buildURLFromBase(filesURL);
  }

  urlForQuery(query: TrackerDataQuery, modelName: string | number) {
    const { fileId, trackerId } = query;

    delete query.fileId;
    delete query.trackerId;

    return this._buildNestedURL(modelName, fileId, trackerId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    trackers: TrackersAdapter;
  }
}
