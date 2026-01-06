import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class SkAppVersionSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  attrs = {
    skStoreInstances: { embedded: 'always' },
  };
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'sk-app-version': SkAppVersionSerializer;
  }
}
