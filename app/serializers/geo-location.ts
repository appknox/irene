import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from '@ember-data/store';

import GeoLocationModel, { type HostUrl } from 'irene/models/geo-location';

type GeoLocationPayload = {
  countryCode: string;
  country_name: string;
  is_high_risk_region: boolean;
  high_risk_reason: string;
  hostUrls: HostUrl[];
};

export default class GeoLocationSerializer extends DRFSerializer {
  primaryKey = 'countryCode';

  normalizeResponse = (
    _store: Store,
    _primaryModelClass: GeoLocationModel,
    payload: GeoLocationPayload[]
  ) => {
    return {
      data: payload
        .filter((item) => item.countryCode && item.countryCode !== '--')
        .map((item) => ({
          id: item.countryCode,
          type: 'geo-location',
          attributes: {
            countryCode: item.countryCode,
            countryName: item.country_name,
            isHighRiskRegion: item.is_high_risk_region,
            highRiskReason: item.high_risk_reason,
            hostUrls: item.hostUrls || [],
          },
        })),
    };
  };
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'geo-location': GeoLocationSerializer;
  }
}
