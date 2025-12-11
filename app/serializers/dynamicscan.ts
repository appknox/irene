import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class DynamicscanSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  attrs = {
    deviceUsed: { embedded: 'always' },
  };
}
