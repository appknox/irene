import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class ApplicationSerializer extends DRFSerializer {}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    application: ApplicationSerializer;
  }
}
