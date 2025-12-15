import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from '@ember-data/store';
import type OrganizationAiFeatureModel from 'irene/models/organization-ai-feature';

export default class OrganizationAiFeatureSerializer extends DRFSerializer {
  normalizeResponse(
    _store: Store,
    _primaryModelClass: OrganizationAiFeatureModel,
    payload: Record<string, unknown>
  ) {
    return {
      data: {
        id: '1', // Static ID
        type: 'organization-ai-feature',
        attributes: payload,
      },
    };
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'organization-ai-feature': OrganizationAiFeatureSerializer;
  }
}
