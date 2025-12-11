import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class AnalysisSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  attrs = {
    attachments: { embedded: 'always' },
  };
}
