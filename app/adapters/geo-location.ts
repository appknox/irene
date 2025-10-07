import CommonDRFAdapter from './commondrf';

export type GeoLocationDataQuery = {
  geoLocationId?: string;
};

export default class GeoLocationAdapter extends CommonDRFAdapter {
  _buildNestedURL(modelName: string | number, geoLocationId?: string) {
    const geoDataURL = `${this.namespace_v2}/geo_request/${geoLocationId}/geo_data`;

    return this.buildURLFromBase(geoDataURL);
  }

  urlForQuery(query: GeoLocationDataQuery, modelName: string | number) {
    const { geoLocationId } = query;

    delete query.geoLocationId;

    return this._buildNestedURL(modelName, geoLocationId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'geo-location': GeoLocationAdapter;
  }
}
