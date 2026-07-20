import { camelize } from '@ember/string';
import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from 'ember-data/store';
import type OrganizationAiFeatureModel from 'irene/models/organization-ai-feature';

function normalizeAttributes(payload: Record<string, unknown>) {
  return Object.entries(payload).reduce<Record<string, unknown>>(
    (attributes, [key, value]) => {
      attributes[camelize(key)] = value;

      return attributes;
    },
    {}
  );
}

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
        attributes: normalizeAttributes(payload),
      },
    };
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'organization-ai-feature': OrganizationAiFeatureSerializer;
  }
}
