import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class AnalysisOverrideRequestSerializer extends DRFSerializer {
  primaryKey = 'uuid';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'analysis-override-request': AnalysisOverrideRequestSerializer;
  }
}
