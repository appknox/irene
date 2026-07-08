import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class SkThirdPartyConfigSerializer extends DRFSerializer {
  primaryKey = 'id';

  attrs = {
    regionsOpted: 'regions_opted',
    topAppsCount: 'top_apps_count',
  };
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'sk-third-party-config': SkThirdPartyConfigSerializer;
  }
}
