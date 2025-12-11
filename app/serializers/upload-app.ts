import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class UploadAppSerializer extends DRFSerializer {
  primaryKey = 'file_key';
}
