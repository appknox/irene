import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class FileSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  attrs = {
    tags: { embedded: 'always' },
  };
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    file: FileSerializer;
  }
}
