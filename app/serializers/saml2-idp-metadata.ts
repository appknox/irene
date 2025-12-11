import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class Saml2IdpMetadataSerializer extends DRFSerializer {
  modelNameFromPayloadKey() {
    return 'saml2-idp-metadata';
  }
}
