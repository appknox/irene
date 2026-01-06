import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from '@ember-data/store';
import type OrganizationSsoModel from 'irene/models/organization-sso';

export default class OrganizationSsoSerializer extends DRFSerializer {
  normalizeResponse(
    _store: Store,
    _primaryModelClass: OrganizationSsoModel,
    payload: Record<string, unknown>
  ) {
    const item = payload;

    return {
      data: {
        id: item['id'] || 'sso-id',
        type: 'organization-sso',
        attributes: {
          enabled: item['enabled'],
          enforced: item['enforced'],
        },
      },
    };
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'organization-sso': OrganizationSsoSerializer;
  }
}
