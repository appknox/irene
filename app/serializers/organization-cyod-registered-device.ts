import DRFSerializer from 'ember-django-adapter/serializers/drf';
import type Store from 'ember-data/store';
import type OrganizationCyodRegisteredDeviceModel from 'irene/models/organization-cyod-registered-device';

export default class OrganizationCyodRegisteredDeviceSerializer extends DRFSerializer {
  normalizeResponse(
    store: Store,
    primaryModelClass: OrganizationCyodRegisteredDeviceModel,
    payload: object,
    id: string | number,
    requestType: string
  ) {
    // The endpoint wraps the list in `results` but omits `next` and
    // `previous`, so DRFSerializer does not read it as a paginated payload and
    // hands the envelope itself down as a single id-less record.
    return super.normalizeResponse(
      store,
      primaryModelClass,
      { next: null, previous: null, ...payload },
      id,
      requestType
    );
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'organization-cyod-registered-device': OrganizationCyodRegisteredDeviceSerializer;
  }
}
