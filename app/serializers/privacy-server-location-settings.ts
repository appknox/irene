import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from 'ember-data/store';
import type PrivacyServerLocationSettingsModel from 'irene/models/privacy-server-location-settings';

export default class PrivacyServerLocationSettingsSerializer extends DRFSerializer {
  normalizeResponse(
    _store: Store,
    _primaryModelClass: PrivacyServerLocationSettingsModel,
    payload: Record<string, unknown>
  ) {
    return {
      data: {
        id: payload['id'],
        type: 'privacy-server-location-settings',
        attributes: {
          customCountries: payload['custom_countries'],
          geoSettings: payload['geo_settings'],
          version: payload['version'],
        },
      },
    };
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'privacy-server-location-settings': PrivacyServerLocationSettingsSerializer;
  }
}
