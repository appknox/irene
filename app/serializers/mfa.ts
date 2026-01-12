import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class MfaSerializer extends DRFSerializer {
  primaryKey = 'method';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    mfa: MfaSerializer;
  }
}
