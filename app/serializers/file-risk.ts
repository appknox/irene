import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class FileRiskSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  primaryKey = 'file';
}
