import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class SkFakeAppSerializer extends DRFSerializer {
  attrs = {
    // API returns the field as "store", but the model uses "skStore"
    // to avoid shadowing Ember Data's `this.store` service.
    skStore: { key: 'store' },
  };
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'sk-fake-app': SkFakeAppSerializer;
  }
}
