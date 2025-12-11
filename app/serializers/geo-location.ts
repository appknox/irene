import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class GeoLocationSerializer extends DRFSerializer {
  primaryKey = 'countryCode';
}
