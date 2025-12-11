import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class SkRequestedAppSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  attrs = {
    appMetadata: { embedded: 'always' },
  };
}
