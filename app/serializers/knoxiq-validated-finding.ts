import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class KnoxiqValidatedFindingSerializer extends DRFSerializer {
  primaryKey = 'finding_id';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'knoxiq-validated-finding': KnoxiqValidatedFindingSerializer;
  }
}
