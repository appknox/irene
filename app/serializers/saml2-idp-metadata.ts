import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class Saml2IdpMetadataSerializer extends DRFSerializer {
  modelNameFromPayloadKey() {
    return 'saml2-idp-metadata';
  }
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'saml2-idp-metadata': Saml2IdpMetadataSerializer;
  }
}
