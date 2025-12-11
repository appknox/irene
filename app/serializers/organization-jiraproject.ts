import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class OrganizationJiraprojectSerializer extends DRFSerializer {
  primaryKey = 'key';
}
