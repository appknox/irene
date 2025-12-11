import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class SubscriptionSerializer extends DRFSerializer {
  primaryKey = 'pk';
}
