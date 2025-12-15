import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class ProjectSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  attrs = {
    lastFile: { embedded: 'always' },
  };
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    project: ProjectSerializer;
  }
}
