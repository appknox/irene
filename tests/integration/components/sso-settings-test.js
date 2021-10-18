import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { underscore } from '@ember/string';

function serializer(payload) {
  console.log('payload', payload);
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

module('Integration | Component | sso-settings', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();
  });

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.server.get(
      'organizations/:orgId/sso/saml2/idp_metadata',
      (schema, req) => {
        console.log('schema', schema);
        console.log('saml2IdpMetadata', schema.saml2IdpMetadata.new());
        console.log('req', req);
        return serializer(schema.saml2IdpMetadata.first());
      }
    );
    this.server.get('v2/sso/saml2/metadata', (schema, req) => {
      console.log('req', req);
      return {
        acs_url: 'https://sherlock.staging.do.appknox.io/api/sso/saml2/acs',
        entity_id: 'https://sherlock.staging.do.appknox.io/api/sso/saml2',
        metadata:
          '<?xml version="1.0"?>\n<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"\n                     validUntil="2021-10-29T06:10:49Z"\n                     cacheDuration="PT604800S"\n                     entityID="https://sherlock.staging.do.appknox.io/api/sso/saml2">\n    <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">\n        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"\n                                Location="https://sherlock.staging.do.appknox.io/api/sso/saml2/sls" />\n        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>\n        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"\n                                     Location="https://sherlock.staging.do.appknox.io/api/sso/saml2/acs"\n                                     index="1" />\n    </md:SPSSODescriptor>\n    <md:Organization>\n        <md:OrganizationName xml:lang="en-US">Appknox</md:OrganizationName>\n        <md:OrganizationDisplayName xml:lang="en-US">Appknox</md:OrganizationDisplayName>\n        <md:OrganizationURL xml:lang="en-US">https://sherlock.staging.do.appknox.io</md:OrganizationURL>\n    </md:Organization>\n    <md:ContactPerson contactType="technical">\n        <md:GivenName>Engineering</md:GivenName>\n        <md:EmailAddress>engineering@appknox.com</md:EmailAddress>\n    </md:ContactPerson>\n    <md:ContactPerson contactType="support">\n        <md:GivenName>Appknox Support</md:GivenName>\n        <md:EmailAddress>support@appknox.com</md:EmailAddress>\n    </md:ContactPerson>\n</md:EntityDescriptor>',
        named_id_format:
          'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      };
    });
    // Template block usage:
    await render(hbs`
     <SsoSettings>
       template block text
     </SsoSettings>
   `);
    assert.dom(`[data-test-sso-title]`).hasText('t:singleSignOn:()');
    assert.dom(`[data-test-sso-sub-title]`).hasText('t:samlAuth:()');
    assert.dom(`[data-test-sso-desc]`).hasText(`t:samlDesc:()`);
    assert.dom(`[data-test-sso-sp-config]`).exists();
    assert.dom(`[data-test-sso-idp-config]`).exists();
  });
});
