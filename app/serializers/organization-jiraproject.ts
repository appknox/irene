import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class OrganizationJiraprojectSerializer extends DRFSerializer {
  primaryKey = 'key';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'organization-jiraproject': OrganizationJiraprojectSerializer;
  }
}
