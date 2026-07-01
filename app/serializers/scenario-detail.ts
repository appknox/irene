import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class ScenarioDetailSerializer extends DRFSerializer.extend(
  EmbeddedRecordsMixin
) {
  attrs = {
    // API returns "is_deleted"; "isDeleted" is reserved by Ember Data's Model base class.
    scenarioDeleted: { key: 'is_deleted' },

    // Detail response embeds the full roles/steps collections inline.
    roles: { embedded: 'always' },
    steps: { embedded: 'always' },
  };
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'scenario-detail': ScenarioDetailSerializer;
  }
}
