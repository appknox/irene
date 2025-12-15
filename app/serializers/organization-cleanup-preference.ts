import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from '@ember-data/store';
import type OrgCleanupPreferenceModel from 'irene/models/organization-cleanup-preference';

export default class OrganizationCleanupPreferenceSerializer extends DRFSerializer {
  normalizeResponse(
    store: Store,
    primaryModelClass: OrgCleanupPreferenceModel,
    payload: Record<string, unknown>,
    id: string | number,
    requestType: string
  ) {
    return super.normalizeResponse(
      store,
      primaryModelClass,
      { ...payload, id: '1' }, // Static ID
      id,
      requestType
    );
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'organization-cleanup-preference': OrganizationCleanupPreferenceSerializer;
  }
}
