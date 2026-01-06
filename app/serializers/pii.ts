import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class PiiSerializer extends DRFSerializer {
  primaryKey = 'type';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    pii: PiiSerializer;
  }
}
