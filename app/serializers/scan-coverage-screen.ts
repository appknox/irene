import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class ScanCoverageScreenSerializer extends DRFSerializer {
  primaryKey = 'identifier';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'scan-coverage-screen': ScanCoverageScreenSerializer;
  }
}
