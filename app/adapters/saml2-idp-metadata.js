import commondrf from './commondrf';

export default class Saml2IdpMetadata extends commondrf {

  _buildURL() {
    return this.buildURLFromBase(`${this.get('namespace')}/organizations/${this.get('organization').selected.id}/sso/saml2/idp_metadata`);
  }

  urlForDeleteRecord() {
    return this.buildURLFromBase(`${this.get('namespace')}/organizations/${this.get('organization').selected.id}/sso/saml2/idp_metadata`);
  }
}
