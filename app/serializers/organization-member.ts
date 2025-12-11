import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class OrganizationMemberSerializer extends DRFSerializer {
  primaryKey = 'member';
}
