import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class PlanSerializer extends DRFSerializer {
  primaryKey = 'pk';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    plan: PlanSerializer;
  }
}
