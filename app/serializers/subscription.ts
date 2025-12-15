import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class SubscriptionSerializer extends DRFSerializer {
  primaryKey = 'pk';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    subscription: SubscriptionSerializer;
  }
}
