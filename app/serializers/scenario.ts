import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class ScenarioSerializer extends DRFSerializer {
  attrs = {
    // API returns "is_deleted"; "isDeleted" is reserved by Ember Data's Model base class.
    scenarioDeleted: { key: 'is_deleted' },
  };
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    scenario: ScenarioSerializer;
  }
}
