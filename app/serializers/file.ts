import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class FileSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  attrs = {
    tags: { embedded: 'always' },
  };
}
