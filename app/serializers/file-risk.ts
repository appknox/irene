import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class FileRiskSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  primaryKey = 'file';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'file-risk': FileRiskSerializer;
  }
}
