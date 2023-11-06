import commondrf from './commondrf';

export default class Saml2IdpMetadataAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/sso/saml2/idp_metadata`
    );
  }

  urlForDeleteRecord() {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/sso/saml2/idp_metadata`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'saml2-idp-metadata': Saml2IdpMetadataAdapter;
  }
}
