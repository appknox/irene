import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class PartnerRegistrationRequestSerializer extends DRFSerializer {}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'partner/registration-request': PartnerRegistrationRequestSerializer;
  }
}
