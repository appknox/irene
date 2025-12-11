import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class PlanSerializer extends DRFSerializer {
  primaryKey = 'pk';
}
