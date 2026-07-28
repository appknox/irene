import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class FileHealthScoreAuditSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'file-health-score-audit': FileHealthScoreAuditSerializer;
  }
}
