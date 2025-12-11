import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class OrganizationCleanupPreferenceSerializer extends DRFSerializer {
  primaryKey = 'is_enabled';
}
