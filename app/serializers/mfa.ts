import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class MfaSerializer extends DRFSerializer {
  primaryKey = 'method';
}
