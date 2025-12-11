import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class ScanCoverageScreenSerializer extends DRFSerializer {
  primaryKey = 'identifier';
}
