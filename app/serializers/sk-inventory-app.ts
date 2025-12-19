import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class SkInventoryAppSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  attrs = {
    appMetadata: { embedded: 'always' },
  };
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'sk-inventory-app': SkInventoryAppSerializer;
  }
}
