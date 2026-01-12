import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class OrganizationMemberSerializer extends DRFSerializer {
  primaryKey = 'member';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'organization-member': OrganizationMemberSerializer;
  }
}
