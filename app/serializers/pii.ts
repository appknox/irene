import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class PiiSerializer extends DRFSerializer {
  primaryKey = 'type';
}
