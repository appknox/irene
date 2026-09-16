import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class SecurityAnalysisFindingSerializer extends DRFSerializer {
  primaryKey = 'finding_id';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'security/analysis-finding': SecurityAnalysisFindingSerializer;
  }
}
