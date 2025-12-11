import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class AttachmentSerializer extends DRFSerializer {
  primaryKey = 'pk';
}
