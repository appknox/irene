import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class GeoLocationSerializer extends DRFSerializer {
  primaryKey = 'countryCode';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'geo-location': GeoLocationSerializer;
  }
}
