import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from 'ember-data/store';
import type PrivacyPiiSettingsModel from 'irene/models/privacy-pii-settings';

export default class PrivacyPiiSettingsSerializer extends DRFSerializer {
  normalizeResponse(
    _store: Store,
    _primaryModelClass: PrivacyPiiSettingsModel,
    payload: Record<string, unknown>
  ) {
    return {
      data: {
        id: payload['id'],
        type: 'privacy-pii-settings',
        attributes: {
          maskPii: payload['mask_pii'],
          piiSettings: payload['pii_settings'],
          version: payload['version'],
          customRegex: payload['custom_regex'],
        },
      },
    };
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'privacy-pii-settings': PrivacyPiiSettingsSerializer;
  }
}
