import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class SkThirdPartyAppSerializer extends DRFSerializer {
  primaryKey = 'package_name';

  attrs = {
    skStore: 'store',
  };
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'sk-third-party-app': SkThirdPartyAppSerializer;
  }
}
