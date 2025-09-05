import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  findAll,
  find,
  click,
  waitUntil,
  fillIn,
} from '@ember/test-helpers';
import { dragAndDrop, selectFiles } from 'ember-file-upload/test-support';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';

const idpMetadataFactory = () => ({
  id: 1,
  entity_id: 'https://accounts.google.com/o/saml2?idpid=Dab47b7859',
  sso_service_url: 'https://accounts.google.com/o/saml2/idp?idpid=Dab47b7859',

  certificate: {
    issuer:
      'ST=Bengaluru,C=IN,OU=Google For Work,CN=Google,L=Mountain View,O=Google Inc.',
    issued_on: faker.date.past(),
    expires_on: faker.date.future(),
    fingerprint_sha1: faker.git.commitSha(),
    fingerprint_sha256: `${faker.git.commitSha()}de9c60e7dab47b7859789f71`,
  },

  created_on: faker.date.past(),
});

const metadataFactory = () => ({
  id: 1,
  entity_id: 'https://app.com/api/sso/saml2',
  acs_url: 'https://app.com/api/sso/saml2/acs',
  named_id_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  metadata:
    '<?xml version="1.0"?>\n<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"\n                     validUntil="2023-01-04T05:48:24Z"\n                     cacheDuration="PT604800S"\n                     entityID="https://app.com/api/sso/saml2">\n    <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">\n        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"\n                                Location="https://app.com/api/sso/saml2/sls" />\n        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>\n        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"\n                                     Location="https://app.com/api/sso/saml2/acs"\n                                     index="1" />\n    </md:SPSSODescriptor>\n    <md:Organization>\n        <md:OrganizationName xml:lang="en-US">Appknox</md:OrganizationName>\n        <md:OrganizationDisplayName xml:lang="en-US">Appknox</md:OrganizationDisplayName>\n        <md:OrganizationURL xml:lang="en-US">https://app.com</md:OrganizationURL>\n    </md:Organization>\n    <md:ContactPerson contactType="technical">\n        <md:GivenName>Engineering</md:GivenName>\n        <md:EmailAddress>engineering@appknox.com</md:EmailAddress>\n    </md:ContactPerson>\n    <md:ContactPerson contactType="support">\n        <md:GivenName>Appknox Support</md:GivenName>\n        <md:EmailAddress>support@appknox.com</md:EmailAddress>\n    </md:ContactPerson>\n</md:EntityDescriptor>',
});

class OrganizationMeStub extends Service {
  org = {
    is_owner: true,
    is_admin: true,
  };
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }
  success(msg) {
    this.successMsg = msg;
  }
}

module('Integration | Component | sso-settings', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    const sso = this.server.create('organization-sso');

    this.setProperties({
      sso,
      store,
      idpMetadata: idpMetadataFactory(),
      metadata: metadataFactory(),
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders sso-settings', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/:id/sso/provider', (schema) => {
      return schema.organizationSsos.first().toJSON();
    });

    this.server.get('/v2/sso/saml2/metadata', () => {
      return this.metadata;
    });

    this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
      return this.idpMetadata;
    });

    await render(hbs`<SsoSettings @organization={{this.organization}} />`);

    assert.dom('[data-test-ssoSettings-title]').hasText(t('singleSignOn'));
    assert.dom('[data-test-ssoSettings-tabs]').exists();
    assert.dom('[data-test-ssoSettings-tab="saml"]').exists();
    assert.dom('[data-test-ssoSettings-tab="oidc"]').exists();
  });

  test('it renders sso-settings with SP config', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/:id/sso/provider', (schema) => {
      return schema.organizationSsos.first().toJSON();
    });

    this.server.get('/v2/sso/saml2/metadata', () => {
      return this.metadata;
    });

    this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
      return this.idpMetadata;
    });

    await render(hbs`<SsoSettings @organization={{this.organization}} />`);

    // sp config
    assert.dom('[data-test-ssoSettings-spTitle]').hasText(t('serviceProvider'));

    assert.dom('[data-test-ssoSettings-spDesc]').hasText(t('spMetadataDesc'));

    // default is manual
    assert
      .dom('[data-test-ssoSettings-spConfigRadioManual]')
      .isNotDisabled()
      .isChecked();

    assert
      .dom('[data-test-ssoSettings-spConfigRadioXml]')
      .isNotDisabled()
      .isNotChecked();

    const spConfigLabels = findAll('[data-test-ssoSettings-spConfigLabel]');
    const spConfigValues = findAll('[data-test-ssoSettings-spConfigValue]');

    assert.dom(spConfigLabels[0]).hasText(t('entityID'));
    assert.dom(spConfigValues[0]).hasText(this.metadata.entity_id);

    assert.dom(spConfigLabels[1]).hasText(t('acsURL'));
    assert.dom(spConfigValues[1]).hasText(this.metadata.acs_url);

    assert.dom(spConfigLabels[2]).hasText(t('nameIDFormat'));
    assert.dom(spConfigValues[2]).hasText(this.metadata.named_id_format);

    assert.dom('[data-test-ssoSettings-spConfigXmlInput]').doesNotExist();

    // switch to xml
    await click('[data-test-ssoSettings-spConfigRadioXml]');

    assert
      .dom('[data-test-ssoSettings-spConfigRadioManual]')
      .isNotDisabled()
      .isNotChecked();

    assert
      .dom('[data-test-ssoSettings-spConfigRadioXml]')
      .isNotDisabled()
      .isChecked();

    assert
      .dom('[data-test-ssoSettings-spConfigXmlInput]')
      .isDisabled()
      .hasValue(this.metadata.metadata);

    assert.dom('[data-test-ssoSettings-spConfigLabel]').doesNotExist();
    assert.dom('[data-test-ssoSettings-spConfigValue]').doesNotExist();
  });

  test('it renders sso-settings with IdP metadata', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/:id/sso/provider', (schema) => {
      return schema.organizationSsos.first().toJSON();
    });

    this.server.get('/v2/sso/saml2/metadata', () => {
      return this.metadata;
    });

    this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
      return this.idpMetadata;
    });

    await render(hbs`<SsoSettings @organization={{this.organization}} />`);

    assert
      .dom('[data-test-ssoSettings-idpTitle]')
      .hasText(t('identityProvider'));

    assert.dom('[data-test-ssoSettings-idpSubtitle]').hasText(t('idpMetadata'));

    assert
      .dom('[data-test-ssoSettings-idpEntityIdLabel]')
      .hasText(t('entityID'));

    assert
      .dom('[data-test-ssoSettings-idpEntityIdValue]')
      .hasText(this.idpMetadata.entity_id);

    assert
      .dom('[data-test-ssoSettings-idpSsoUrlLabel]')
      .hasText(t('ssoServiceURL'));

    assert
      .dom('[data-test-ssoSettings-idpSsoUrlValue]')
      .hasText(this.idpMetadata.sso_service_url);

    // certificate
    assert
      .dom('[data-test-ssoSettings-idpCertSubtitle]')
      .hasText(t('certificate'));

    assert
      .dom('[data-test-ssoSettings-idpCertIssuerLabel]')
      .hasText(t('issuer'));

    assert
      .dom('[data-test-ssoSettings-idpCertIssuerValue]')
      .hasText(this.idpMetadata.certificate.issuer);

    assert
      .dom('[data-test-ssoSettings-idpCertIssuedOnLabel]')
      .hasText(t('issuedOn'));

    assert
      .dom('[data-test-ssoSettings-idpCertIssuedOnValue]')
      .hasText(
        dayjs(this.idpMetadata.certificate.issued_on).format(
          'DD MMM YYYY HH:mm:ss A'
        )
      );

    assert
      .dom('[data-test-ssoSettings-idpCertExpiryLabel]')
      .hasText(t('expiry'));

    assert
      .dom('[data-test-ssoSettings-idpCertExpiryValue]')
      .hasText(
        dayjs(this.idpMetadata.certificate.expires_on).format(
          'DD MMM YYYY HH:mm:ss A'
        )
      );

    assert
      .dom('[data-test-ssoSettings-idpCertFPLabel]')
      .hasText(t('fingerprints'));

    assert
      .dom('[data-test-ssoSettings-idpCertFPValue-SHA256]')
      .hasText(
        `${t('SHA256')} ${this.idpMetadata.certificate.fingerprint_sha256}`
      );

    assert
      .dom('[data-test-ssoSettings-idpCertFPValue-SHA1]')
      .hasText(`${t('SHA1')} ${this.idpMetadata.certificate.fingerprint_sha1}`);
  });

  test('it renders sso-settings without IdP metadata', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/:id/sso/provider', (schema) => {
      return schema.organizationSsos.first().toJSON();
    });

    this.server.get('/v2/sso/saml2/metadata', () => {
      return this.metadata;
    });

    this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
      return new Response(404);
    });

    await render(hbs`<SsoSettings @organization={{this.organization}} />`);

    assert
      .dom('[data-test-ssoSettings-idpTitle]')
      .hasText(t('identityProvider'));

    assert
      .dom('[data-test-ssoSettings-idpUploadText]')
      .hasText(t('idpMetadataUpload'));

    assert.dom('[data-test-ssoSettings-idpUploadFileIcon]').exists();

    assert
      .dom('[data-test-ssoSettings-idpUploadFileDragDropText]')
      .hasText(`${t('dragDropFile')} ${t('or')}`);

    assert.dom('[data-test-ssoSettings-idpUploadFileInput]').exists();

    assert
      .dom('[data-test-ssoSettings-idpUploadFileBtn]')
      .hasText(t('browseFiles'));
  });

  test('it renders sso-settings with idp config', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/:id/sso/provider', (schema) => {
      return schema.organizationSsos.first().toJSON();
    });

    this.server.get('/v2/sso/saml2/metadata', () => {
      return this.metadata;
    });

    this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
      return this.idpMetadata;
    });

    await render(hbs`<SsoSettings @organization={{this.organization}} />`);

    assert
      .dom('[data-test-ssoSettings-ssoTitle]')
      .hasText(t('ssoAuthentication'));

    assert
      .dom('[data-test-ssoSettings-ssoSwitchLabel] [data-test-ak-form-label]')
      .hasText(`${t('enable')} ${t('ssoAuthentication')}`);

    assert
      .dom('[data-test-ssoSettings-ssoEnableDesc]')
      .hasText(`(${t('ssoEnableDesc')})`);

    if (this.sso.enabled) {
      assert
        .dom('[data-test-ssoSettings-ssoSwitch] input')
        .isNotDisabled()
        .isChecked();

      assert
        .dom(
          '[data-test-ssoSettings-ssoEnforceLabel] [data-test-ak-form-label]'
        )
        .hasText(t('enforceSSO'));

      assert
        .dom('[data-test-ssoSettings-ssoEnforceCheckbox]')
        .isNotDisabled()
        [this.sso.enforced ? 'isChecked' : 'isNotChecked']();

      assert
        .dom('[data-test-ssoSettings-ssoEnforceDesc]')
        .hasText(`(${t('ssoEnforceDesc')})`);
    } else {
      assert
        .dom('[data-test-ssoSettings-ssoSwitch] input')
        .isNotDisabled()
        .isNotChecked();

      assert.dom('[data-test-ssoSettings-ssoEnforceLabel]').doesNotExist();
      assert.dom('[data-test-ssoSettings-ssoEnforceCheckbox]').doesNotExist();
      assert.dom('[data-test-ssoSettings-ssoEnforceDesc]').doesNotExist();
    }

    // Switch to oidc tab
    await click('[data-test-ssoSettings-tab="oidc"] button');

    assert
      .dom('[data-test-ssoSettings-warningBanner]')
      .hasText(t('ssoSettings.saml.warning'));

    assert.dom('[data-test-ssoSettings-stepsDisplay]').exists();

    assert
      .dom('[data-test-ssoSettings-stepsDisplay-title]')
      .hasText(t('ssoSettings.saml.title'));

    assert.dom('[data-test-ssoSettings-stepsDisplayStep]').exists({
      count: 3,
    });
  });

  test('it renders OIDC tab and form when no providers exist', async function (assert) {
    this.server.get('/organizations/:id/sso/oidc', () => {
      return new Response(404);
    });

    await render(hbs`<SsoSettings @organization={{this.organization}} />`);

    // Switch to OIDC tab
    await click('[data-test-ssoSettings-tab="oidc"] button');

    assert
      .dom('[data-test-ssoSettings-oidcTitle]')
      .hasText(t('ssoSettings.oidc.addOidcProvider'));

    assert.dom('[data-test-ssoSettings-oidcDesc]').hasText(t('oidcDesc'));

    assert.dom('[data-test-ssoSettings-oidc-clientID]').exists();
    assert.dom('[data-test-ssoSettings-oidc-clientSecret]').exists();
    assert.dom('[data-test-ssoSettings-oidc-discoveryURL]').exists();
    assert.dom('[data-test-ssoSettings-oidc-createProviderBtn]').exists();
    assert.dom('[data-test-ssoSettings-oidc-resetBtn]').exists();
  });

  test('it shows OIDC provider info when provider exists', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/1/sso/saml2/idp_metadata', () => {
      return new Response(404);
    });

    this.server.get('/organizations/:id/sso/provider', () => {
      return new Response(200, {}, { enabled: false, enforced: false });
    });

    const provider = this.server.create('oidc-provider');

    this.server.get('/organizations/:id/sso/oidc', (schema) => {
      return schema.oidcProviders.all().models;
    });

    await render(hbs`<SsoSettings @organization={{this.organization}} />`);

    assert.dom('[data-test-ssoSettings-oidcDiscoveryUrl]').exists();

    assert
      .dom('[data-test-ssoSettings-oidcDiscoveryUrl]')
      .hasText(provider.discovery_url);

    assert.dom('[data-test-ssoSettings-oidcDeleteBtn]').exists();

    // Switch to SAML tab
    await click('[data-test-ssoSettings-tab="saml"] button');

    assert
      .dom('[data-test-ssoSettings-warningBanner]')
      .hasText(t('ssoSettings.oidc.warning'));

    assert.dom('[data-test-ssoSettings-stepsDisplay]').exists();

    assert
      .dom('[data-test-ssoSettings-stepsDisplay-title]')
      .hasText(t('ssoSettings.oidc.title'));

    assert.dom('[data-test-ssoSettings-stepsDisplayStep]').exists({
      count: 3,
    });
  });

  test('it creates a new OIDC provider', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.set('fail', true);

    this.server.get('/organizations/1/sso/saml2/idp_metadata', () => {
      return new Response(404);
    });

    this.server.get('/organizations/:id/sso/provider', () => {
      return new Response(200, {}, { enabled: false, enforced: false });
    });

    const provider = this.server.create('oidc-provider');

    this.server.get('/organizations/:id/sso/oidc', (schema) => {
      return this.fail ? new Response(404) : schema.oidcProviders.all().models;
    });

    this.server.post('/organizations/:id/sso/oidc', (schema) => {
      this.set('fail', false);

      return schema.oidcProviders.all().models;
    });

    await render(hbs`<SsoSettings @organization={{this.organization}} />`);

    // Switch to OIDC tab
    await click('[data-test-ssoSettings-tab="oidc"] button');

    // Fill in the form
    await fillIn('[data-test-ssoSettings-oidc-clientID]', provider.client_id);

    await fillIn(
      '[data-test-ssoSettings-oidc-clientSecret]',
      provider.client_secret
    );

    await fillIn(
      '[data-test-ssoSettings-oidc-discoveryURL]',
      provider.discovery_url
    );

    // Submit the form
    await click('[data-test-ssoSettings-oidc-createProviderBtn]');

    // Verify the provider is shown
    assert
      .dom('[data-test-ssoSettings-oidcDiscoveryUrl]')
      .hasText(provider.discovery_url);
  });

  test('it deletes an OIDC provider', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;
    this.setProperties({ organization });

    const provider = this.server.create('oidc-provider');
    let providerDeleted = false;

    this.server.get('/organizations/1/sso/saml2/idp_metadata', () => {
      return new Response(404);
    });

    this.server.get('/organizations/:id/sso/provider', (schema) => {
      const json = schema.organizationSsos.first()?.toJSON();

      return { ...json, enabled: false };
    });

    this.server.get('/organizations/:id/sso/oidc', (schema) => {
      if (providerDeleted) {
        return new Response(404);
      }

      return schema.oidcProviders.all().models;
    });

    this.server.delete('/organizations/:id/sso/oidc', () => {
      providerDeleted = true;
      return new Response(204, {}, '');
    });

    await render(hbs`<SsoSettings @organization={{this.organization}} />`);

    // Switch to OIDC tab first
    await click('[data-test-ssoSettings-tab="oidc"] button');

    assert
      .dom('[data-test-ssoSettings-oidc-spTitle]')
      .hasText(t('serviceProvider'));

    assert
      .dom('[data-test-ssoSettings-oidc-redirectUrl]')
      .containsText('/sso/oidc/redirect');

    // Verify provider exists
    assert.dom('[data-test-ssoSettings-oidcDiscoveryUrl]').exists();

    assert
      .dom('[data-test-ssoSettings-oidcDiscoveryUrl]')
      .hasText(provider.discovery_url);

    assert.dom('[data-test-ssoSettings-oidcDeleteBtn]').isNotDisabled();

    // Click delete button
    await click('[data-test-ssoSettings-oidcDeleteBtn]');

    // Verify confirmation dialog
    assert
      .dom('[data-test-confirmbox-description]')
      .hasText(t('confirmBox.deleteOIDCConfig'));

    // Confirm deletion
    await click('[data-test-confirmBox-confirmBtn]');

    // Verify the form is shown again (provider deleted)
    assert
      .dom('[data-test-ssoSettings-oidcTitle]')
      .hasText(t('ssoSettings.oidc.addOidcProvider'));
    assert.dom('[data-test-ssoSettings-oidcDesc]').hasText(t('oidcDesc'));
    assert.dom('[data-test-ssoSettings-oidc-clientID]').exists();
    assert.dom('[data-test-ssoSettings-oidc-clientSecret]').exists();
    assert.dom('[data-test-ssoSettings-oidc-discoveryURL]').exists();
    assert.dom('[data-test-ssoSettings-oidc-createProviderBtn]').exists();
    assert.dom('[data-test-ssoSettings-oidc-resetBtn]').exists();

    // Verify provider info is no longer shown
    assert.dom('[data-test-ssoSettings-oidcDiscoveryUrl]').doesNotExist();
    assert.dom('[data-test-ssoSettings-oidcDeleteBtn]').doesNotExist();
  });

  test.each(
    'it should enable sso in sso-settings OIDC tab',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const organization = this.owner.lookup('service:organization').selected;

      this.setProperties({ organization });

      // Create an OIDC provider
      this.server.create('oidc-provider');

      this.server.get('/organizations/:id/sso/provider', (schema) => {
        const json = schema.organizationSsos.first().toJSON();

        return { ...json, enabled: false };
      });

      this.server.put('/organizations/:id/sso/provider', (_, req) => {
        return fail
          ? new Response(500)
          : { id: req.params.id, ...JSON.parse(req.requestBody) };
      });

      this.server.get('/organizations/1/sso/saml2/idp_metadata', () => {
        return new Response(404);
      });

      this.server.get('/organizations/:id/sso/oidc', (schema) => {
        return schema.oidcProviders.all().models;
      });

      await render(hbs`<SsoSettings @organization={{this.organization}} />`);

      // Switch to OIDC tab
      await click('[data-test-ssoSettings-tab="oidc"] button');

      assert
        .dom('[data-test-ssoSettings-oidc-spTitle]')
        .hasText(t('serviceProvider'));

      assert
        .dom('[data-test-ssoSettings-ssoSwitch] input')
        .isNotDisabled()
        .isNotChecked();

      assert.dom('[data-test-ssoSettings-ssoEnforceLabel]').doesNotExist();
      assert.dom('[data-test-ssoSettings-ssoEnforceCheckbox]').doesNotExist();
      assert.dom('[data-test-ssoSettings-ssoEnforceDesc]').doesNotExist();

      // Delete button should not be visible when SSO is disabled
      assert.dom('[data-test-ssoSettings-oidcDeleteBtn]').exists();

      await click('[data-test-ssoSettings-ssoSwitch] input');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.ok(notify.errorMsg);
      } else {
        assert.strictEqual(
          notify.successMsg,
          `${t('ssoAuthentication')} ${t('enabled')}`
        );

        // Delete button should not exist after enabling SSO
        assert.dom('[data-test-ssoSettings-oidcDeleteBtn]').doesNotExist();

        assert
          .dom('[data-test-ssoSettings-ssoSwitch] input')
          .isNotDisabled()
          .isChecked();

        assert
          .dom(
            '[data-test-ssoSettings-ssoEnforceLabel] [data-test-ak-form-label]'
          )
          .hasText(t('enforceSSO'));

        assert
          .dom('[data-test-ssoSettings-ssoEnforceCheckbox]')
          .isNotDisabled();

        assert
          .dom('[data-test-ssoSettings-ssoEnforceDesc]')
          .hasText(`(${t('ssoEnforceDesc')})`);
      }
    }
  );

  test.each(
    'it should enable enforce sso in sso-settings OIDC tab',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const organization = this.owner.lookup('service:organization').selected;

      this.setProperties({ organization });

      // Create an OIDC provider
      this.server.create('oidc-provider');

      this.server.get('/organizations/:id/sso/provider', (schema) => {
        const json = schema.organizationSsos.first().toJSON();

        return { ...json, enabled: true, enforced: false };
      });

      this.server.put('/organizations/:id/sso/provider', (_, req) => {
        return fail
          ? new Response(500)
          : { id: req.params.id, ...JSON.parse(req.requestBody) };
      });

      this.server.get('/organizations/1/sso/saml2/idp_metadata', () => {
        return new Response(404);
      });

      this.server.get('/organizations/:id/sso/oidc', (schema) => {
        return schema.oidcProviders.all().models;
      });

      await render(hbs`<SsoSettings @organization={{this.organization}} />`);

      // Switch to OIDC tab
      await click('[data-test-ssoSettings-tab="oidc"] button');

      assert.dom('[data-test-ssoSettings-tab="oidc"]').exists();

      // Delete button should not be visible when SSO is enabled
      assert.dom('[data-test-ssoSettings-oidcDeleteBtn]').doesNotExist();

      assert
        .dom(
          '[data-test-ssoSettings-ssoEnforceLabel] [data-test-ak-form-label]'
        )
        .hasText(t('enforceSSO'));

      assert
        .dom('[data-test-ssoSettings-ssoEnforceCheckbox]')
        .isNotDisabled()
        .isNotChecked();

      assert
        .dom('[data-test-ssoSettings-ssoEnforceDesc]')
        .hasText(`(${t('ssoEnforceDesc')})`);

      await click('[data-test-ssoSettings-ssoEnforceCheckbox]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.ok(notify.errorMsg);
      } else {
        assert.strictEqual(
          notify.successMsg,
          `${t('ssoEnforceTurned')} ${t('on')}`
        );

        assert
          .dom('[data-test-ssoSettings-ssoEnforceCheckbox]')
          .isNotDisabled()
          .isChecked();

        // Delete button should not be visible when enforce is enabled
        assert.dom('[data-test-ssoSettings-oidcDeleteBtn]').doesNotExist();
      }
    }
  );

  test.each(
    'it should upload IdP metadata in sso-settings SAML tab',
    [{ fail: false }, { dragDrop: true, fail: false }, { fail: true }],
    async function (assert, { fail, dragDrop }) {
      const organization = this.owner.lookup('service:organization').selected;

      this.setProperties({ organization, returnIdpMetaData: false });

      this.server.get('/organizations/:id/sso/provider', () => {
        return new Response(404);
      });

      this.server.get('/organizations/:id/sso/oidc', () => {
        return new Response(404);
      });

      this.server.get('/v2/sso/saml2/metadata', () => {
        return this.metadata;
      });

      this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
        if (this.returnIdpMetaData) {
          return this.idpMetadata;
        }

        this.set('returnIdpMetaData', true);

        return new Response(404);
      });

      this.server.post('/organizations/:id/sso/saml2/idp_metadata', () => {
        return fail ? new Response(504) : {};
      });

      await render(hbs`<SsoSettings @organization={{this.organization}} />`);

      assert.dom('[data-test-ssoSettings-idpUploadFileInput]').exists();

      const { metadata } = this.metadata;

      let file = new File([metadata], 'appknox.xml', { type: 'text/xml' });

      if (dragDrop) {
        await dragAndDrop('[data-test-ssoSettings-idpUploadFileInput]', file);
      } else {
        await selectFiles('[data-test-ssoSettings-idpUploadFileInput]', file);
      }

      await waitUntil(
        () => {
          return (
            find('[data-test-ssoSettings-idpUploadFileProcessing]') === null
          );
        },
        { timeout: 2000 }
      );

      assert
        .dom('[data-test-ssoSettings-idpMetadataXmlInput]')
        .isNotDisabled()
        .hasValue(metadata);

      assert
        .dom('[data-test-ssoSettings-idpMetadataXmlSubmitBtn]')
        .isNotDisabled()
        .hasText(t('upload'));

      assert
        .dom('[data-test-ssoSettings-idpMetadataXmlCancelBtn]')
        .isNotDisabled()
        .hasText(t('cancel'));

      await click('[data-test-ssoSettings-idpMetadataXmlSubmitBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.ok(notify.errorMsg);
        assert.dom('[data-test-ssoSettings-idpMetadataXmlInput]').exists();
        assert.dom('[data-test-ssoSettings-idpMetadataXmlSubmitBtn]').exists();
        assert.dom('[data-test-ssoSettings-idpMetadataXmlCancelBtn]').exists();
      } else {
        assert.strictEqual(
          notify.successMsg,
          t('ssoSettings.saml.successMessage')
        );

        assert
          .dom('[data-test-ssoSettings-idpMetadataXmlInput]')
          .doesNotExist();

        assert
          .dom('[data-test-ssoSettings-idpMetadataXmlSubmitBtn]')
          .doesNotExist();

        assert
          .dom('[data-test-ssoSettings-idpMetadataXmlCancelBtn]')
          .doesNotExist();
      }
    }
  );

  test.each(
    'it should delete idp config in sso-settings SAML tab',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const organization = this.owner.lookup('service:organization').selected;

      this.setProperties({ organization });

      this.server.get('/organizations/:id/sso/provider', (schema) => {
        const json = schema.organizationSsos.first().toJSON();

        return { ...json, enabled: false };
      });

      this.server.get('/v2/sso/saml2/metadata', () => {
        return this.metadata;
      });

      this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
        return this.idpMetadata;
      });

      this.server.delete(
        '/organizations/:id/sso/saml2/idp_metadata',
        (_, req) => {
          return fail
            ? new Response(500)
            : { id: req.params.id, ...JSON.parse(req.requestBody) };
        }
      );

      await render(hbs`<SsoSettings @organization={{this.organization}} />`);

      assert
        .dom('[data-test-ssoSettings-ssoSwitch] input')
        .isNotDisabled()
        .isNotChecked();

      assert.dom('[data-test-ssoSettings-idpDeleteBtn]').isNotDisabled();

      await click('[data-test-ssoSettings-idpDeleteBtn]');

      assert.dom('[data-test-ak-modal-header]').hasText(t('confirm'));

      assert
        .dom('[data-test-confirmbox-description]')
        .hasText(t('confirmBox.deleteIdpConfig'));

      assert
        .dom('[data-test-confirmbox-confirmBtn]')
        .isNotDisabled()
        .hasText(t('delete'));

      assert
        .dom('[data-test-confirmbox-cancelBtn]')
        .isNotDisabled()
        .hasText(t('cancel'));

      await click('[data-test-confirmbox-confirmBtn]');

      const notify = this.owner.lookup('service:notifications');

      assert.dom('[data-test-ak-modal-header]').doesNotExist();
      assert.dom('[data-test-confirmbox-description]').doesNotExist();
      assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
      assert.dom('[data-test-confirmbox-cancelBtn]').doesNotExist();

      if (!fail) {
        assert.strictEqual(notify.successMsg, t('ssoSettings.saml.deletedIdp'));
      }
    }
  );

  test.each(
    'it should enable sso in sso-settings SAML tab',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const organization = this.owner.lookup('service:organization').selected;

      this.setProperties({ organization });

      this.server.get('/organizations/:id/sso/provider', (schema) => {
        const json = schema.organizationSsos.first().toJSON();

        return { ...json, enabled: false };
      });

      this.server.put('/organizations/:id/sso/provider', (_, req) => {
        return fail
          ? new Response(500)
          : { id: req.params.id, ...JSON.parse(req.requestBody) };
      });

      this.server.get('/v2/sso/saml2/metadata', () => {
        return this.metadata;
      });

      this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
        return this.idpMetadata;
      });

      await render(hbs`<SsoSettings @organization={{this.organization}} />`);

      assert
        .dom('[data-test-ssoSettings-ssoSwitch] input')
        .isNotDisabled()
        .isNotChecked();

      assert.dom('[data-test-ssoSettings-ssoEnforceLabel]').doesNotExist();
      assert.dom('[data-test-ssoSettings-ssoEnforceCheckbox]').doesNotExist();
      assert.dom('[data-test-ssoSettings-ssoEnforceDesc]').doesNotExist();

      assert.dom('[data-test-ssoSettings-idpDeleteBtn]').isNotDisabled();

      await click('[data-test-ssoSettings-ssoSwitch] input');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.ok(notify.errorMsg);
      } else {
        assert.strictEqual(
          notify.successMsg,
          `${t('ssoAuthentication')} ${t('enabled')}`
        );

        assert.dom('[data-test-ssoSettings-idpDeleteBtn]').doesNotExist();

        assert
          .dom('[data-test-ssoSettings-ssoSwitch] input')
          .isNotDisabled()
          .isChecked();

        assert
          .dom(
            '[data-test-ssoSettings-ssoEnforceLabel] [data-test-ak-form-label]'
          )
          .hasText(t('enforceSSO'));

        assert
          .dom('[data-test-ssoSettings-ssoEnforceCheckbox]')
          .isNotDisabled();

        assert
          .dom('[data-test-ssoSettings-ssoEnforceDesc]')
          .hasText(`(${t('ssoEnforceDesc')})`);
      }
    }
  );

  test.each(
    'it should enable enforce sso in sso-settings SAML Auth tab',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const organization = this.owner.lookup('service:organization').selected;

      this.setProperties({ organization });

      this.server.get('/organizations/:id/sso/provider', (schema) => {
        const json = schema.organizationSsos.first().toJSON();

        return { ...json, enabled: true, enforced: false };
      });

      this.server.put('/organizations/:id/sso/provider', (_, req) => {
        return fail
          ? new Response(500)
          : { id: req.params.id, ...JSON.parse(req.requestBody) };
      });

      this.server.get('/v2/sso/saml2/metadata', () => {
        return this.metadata;
      });

      this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
        return this.idpMetadata;
      });

      await render(hbs`<SsoSettings @organization={{this.organization}} />`);

      assert.dom('[data-test-ssoSettings-tab="saml"]').exists();

      assert
        .dom(
          '[data-test-ssoSettings-ssoEnforceLabel] [data-test-ak-form-label]'
        )
        .hasText(t('enforceSSO'));

      assert
        .dom('[data-test-ssoSettings-ssoEnforceCheckbox]')
        .isNotDisabled()
        .isNotChecked();

      assert
        .dom('[data-test-ssoSettings-ssoEnforceDesc]')
        .hasText(`(${t('ssoEnforceDesc')})`);

      await click('[data-test-ssoSettings-ssoEnforceCheckbox]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.ok(notify.errorMsg);
      } else {
        assert.strictEqual(
          notify.successMsg,
          `${t('ssoEnforceTurned')} ${t('on')}`
        );

        assert
          .dom('[data-test-ssoSettings-ssoEnforceCheckbox]')
          .isNotDisabled()
          .isChecked();
      }
    }
  );
});
