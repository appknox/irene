import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  findAll,
  find,
  click,
  triggerEvent,
  waitUntil,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import dayjs from 'dayjs';
import faker from 'faker';

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
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    const sso = this.server.create('organization-sso');

    this.setProperties({
      sso,
      idpMetadata: idpMetadataFactory(),
      metadata: metadataFactory(),
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders sso-settings', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/:id/sso/saml2', (schema) => {
      return schema.organizationSsos.first().toJSON();
    });

    this.server.get('/v2/sso/saml2/metadata', () => {
      return this.metadata;
    });

    this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
      return this.idpMetadata;
    });

    await render(hbs`<SsoSettings @organization={{this.organization}} />`);

    assert.dom('[data-test-ssoSetting-title]').hasText('t:singleSignOn:()');
    assert.dom('[data-test-ssoSetting-subtitle]').hasText('t:samlAuth:()');
    assert.dom('[data-test-ssoSetting-desc]').hasText('t:samlDesc:()');
  });

  test('it renders sso-settings with SP config', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/:id/sso/saml2', (schema) => {
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
    assert
      .dom('[data-test-ssoSetting-spTitle]')
      .hasText('t:serviceProvider:() (SP)');

    assert.dom('[data-test-ssoSetting-spDesc]').hasText('t:spMetadataDesc:()');

    // default is manual
    assert
      .dom('[data-test-ssoSetting-spConfigRadioManual]')
      .isNotDisabled()
      .isChecked();

    assert
      .dom('[data-test-ssoSetting-spConfigRadioXml]')
      .isNotDisabled()
      .isNotChecked();

    const spConfigLabels = findAll('[data-test-ssoSetting-spConfigLabel]');
    const spConfigValues = findAll('[data-test-ssoSetting-spConfigValue]');

    assert.dom(spConfigLabels[0]).hasText('t:entityID:()');
    assert.dom(spConfigValues[0]).hasText(this.metadata.entity_id);

    assert.dom(spConfigLabels[1]).hasText('t:acsURL:()');
    assert.dom(spConfigValues[1]).hasText(this.metadata.acs_url);

    assert.dom(spConfigLabels[2]).hasText('t:nameIDFormat:()');
    assert.dom(spConfigValues[2]).hasText(this.metadata.named_id_format);

    assert.dom('[data-test-ssoSetting-spConfigXmlInput]').doesNotExist();

    // switch to xml
    await click('[data-test-ssoSetting-spConfigRadioXml]');

    assert
      .dom('[data-test-ssoSetting-spConfigRadioManual]')
      .isNotDisabled()
      .isNotChecked();

    assert
      .dom('[data-test-ssoSetting-spConfigRadioXml]')
      .isNotDisabled()
      .isChecked();

    assert
      .dom('[data-test-ssoSetting-spConfigXmlInput]')
      .isNotDisabled()
      .hasValue(this.metadata.metadata);

    assert.dom('[data-test-ssoSetting-spConfigLabel]').doesNotExist();
    assert.dom('[data-test-ssoSetting-spConfigValue]').doesNotExist();
  });

  test('it renders sso-settings with IdP metadata', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/:id/sso/saml2', (schema) => {
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
      .dom('[data-test-ssoSetting-idpTitle]')
      .hasText('t:identityProvider:() (IdP)');

    assert
      .dom('[data-test-ssoSetting-idpSubtitle]')
      .hasText('t:idpMetadata:()');

    assert
      .dom('[data-test-ssoSetting-idpEntityIdLabel]')
      .hasText('t:entityID:()');

    assert
      .dom('[data-test-ssoSetting-idpEntityIdValue]')
      .hasText(this.idpMetadata.entity_id);

    assert
      .dom('[data-test-ssoSetting-idpSsoUrlLabel]')
      .hasText('t:ssoServiceURL:()');

    assert
      .dom('[data-test-ssoSetting-idpSsoUrlValue]')
      .hasText(this.idpMetadata.sso_service_url);

    // certificate
    assert
      .dom('[data-test-ssoSetting-idpCertSubtitle]')
      .hasText('t:certificate:()');

    assert
      .dom('[data-test-ssoSetting-idpCertIssuerLabel]')
      .hasText('t:issuer:()');

    assert
      .dom('[data-test-ssoSetting-idpCertIssuerValue]')
      .hasText(this.idpMetadata.certificate.issuer);

    assert
      .dom('[data-test-ssoSetting-idpCertIssuedOnLabel]')
      .hasText('t:issuedOn:()');

    assert
      .dom('[data-test-ssoSetting-idpCertIssuedOnValue]')
      .hasText(
        dayjs(this.idpMetadata.certificate.issued_on).format(
          'DD MMM YYYY HH:mm:ss A'
        )
      );

    assert
      .dom('[data-test-ssoSetting-idpCertExpiryLabel]')
      .hasText('t:expiry:()');

    assert
      .dom('[data-test-ssoSetting-idpCertExpiryValue]')
      .hasText(
        dayjs(this.idpMetadata.certificate.expires_on).format(
          'DD MMM YYYY HH:mm:ss A'
        )
      );

    assert
      .dom('[data-test-ssoSetting-idpCertFPLabel]')
      .hasText('t:fingerprints:()');

    assert
      .dom('[data-test-ssoSetting-idpCertFPValue-SHA256]')
      .hasText(`SHA256 ${this.idpMetadata.certificate.fingerprint_sha256}`);

    assert
      .dom('[data-test-ssoSetting-idpCertFPValue-SHA1]')
      .hasText(`SHA1 ${this.idpMetadata.certificate.fingerprint_sha1}`);
  });

  test('it renders sso-settings without IdP metadata', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/:id/sso/saml2', (schema) => {
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
      .dom('[data-test-ssoSetting-idpTitle]')
      .hasText('t:identityProvider:() (IdP)');

    assert
      .dom('[data-test-ssoSetting-idpUploadText]')
      .hasText('t:idpMetadataUpload:()');

    assert.dom('[data-test-ssoSetting-idpUploadFileIcon]').exists();

    assert
      .dom('[data-test-ssoSetting-idpUploadFileDragDropText]')
      .hasText('t:dragDropFile:() t:or:()');

    assert.dom('[data-test-ssoSetting-idpUploadFileLabel]').exists();

    assert
      .dom('[data-test-ssoSetting-idpUploadFileBtn]')
      .hasText('t:browseFiles:()');
  });

  test('it renders sso-settings with sso config', async function (assert) {
    const organization = this.owner.lookup('service:organization').selected;

    this.setProperties({ organization });

    this.server.get('/organizations/:id/sso/saml2', (schema) => {
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
      .dom('[data-test-ssoSetting-ssoTitle]')
      .hasText('t:ssoAuthentication:()');

    assert
      .dom('[data-test-ssoSetting-ssoSwitchLabel] [data-test-ak-form-label]')
      .hasText('t:enable:() t:ssoAuthentication:()');

    assert
      .dom('[data-test-ssoSetting-ssoEnableDesc]')
      .hasText('(t:ssoEnableDesc:())');

    if (this.sso.enabled) {
      assert
        .dom('[data-test-ssoSetting-ssoSwitch] input')
        .isNotDisabled()
        .isChecked();

      assert
        .dom('[data-test-ssoSetting-ssoEnforceLabel] [data-test-ak-form-label]')
        .hasText('t:ssoEnforce:()');

      assert
        .dom('[data-test-ssoSetting-ssoEnforceCheckbox]')
        .isNotDisabled()
        [this.sso.enforced ? 'isChecked' : 'isNotChecked']();

      assert
        .dom('[data-test-ssoSetting-ssoEnforceDesc]')
        .hasText('(t:ssoEnforceDesc:())');
    } else {
      assert
        .dom('[data-test-ssoSetting-ssoSwitch] input')
        .isNotDisabled()
        .isNotChecked();

      assert.dom('[data-test-ssoSetting-ssoEnforceLabel]').doesNotExist();
      assert.dom('[data-test-ssoSetting-ssoEnforceCheckbox]').doesNotExist();
      assert.dom('[data-test-ssoSetting-ssoEnforceDesc]').doesNotExist();
    }
  });

  test.each(
    'it should upload IdP metadata in sso-settings',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const organization = this.owner.lookup('service:organization').selected;

      this.setProperties({ organization, returnIdpMetaData: false });

      this.server.get('/organizations/:id/sso/saml2', (schema) => {
        return schema.organizationSsos.first().toJSON();
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

      assert.dom('[data-test-ssoSetting-idpUploadFileLabel]').exists();

      const { metadata } = this.metadata;

      let blob = new Blob([metadata], { type: 'text/xml' });
      blob.name = 'appknox.xml';

      await triggerEvent(
        '[data-test-ssoSetting-idpUploadFileLabel] input',
        'change',
        {
          files: [blob],
        }
      );

      await waitUntil(
        () => {
          return (
            find('[data-test-ssoSetting-idpUploadFileProcessing]') === null
          );
        },
        { timeout: 2000 }
      );

      assert
        .dom('[data-test-ssoSetting-idpMetadataXmlInput]')
        .isNotDisabled()
        .hasValue(metadata);

      assert
        .dom('[data-test-ssoSetting-idpMetadataXmlSubmitBtn]')
        .isNotDisabled()
        .hasText('t:upload:()');

      assert
        .dom('[data-test-ssoSetting-idpMetadataXmlCancelBtn]')
        .isNotDisabled()
        .hasText('t:cancel:()');

      await click('[data-test-ssoSetting-idpMetadataXmlSubmitBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.ok(notify.errorMsg);
        assert.dom('[data-test-ssoSetting-idpMetadataXmlInput]').exists();
        assert.dom('[data-test-ssoSetting-idpMetadataXmlSubmitBtn]').exists();
        assert.dom('[data-test-ssoSetting-idpMetadataXmlCancelBtn]').exists();
      } else {
        assert.strictEqual(
          notify.successMsg,
          'Uploaded IdP Metadata Config successfully'
        );

        assert.dom('[data-test-ssoSetting-idpMetadataXmlInput]').doesNotExist();

        assert
          .dom('[data-test-ssoSetting-idpMetadataXmlSubmitBtn]')
          .doesNotExist();

        assert
          .dom('[data-test-ssoSetting-idpMetadataXmlCancelBtn]')
          .doesNotExist();
      }
    }
  );

  test.each(
    'it should delete idp config in sso-settings',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const organization = this.owner.lookup('service:organization').selected;

      this.setProperties({ organization });

      this.server.get('/organizations/:id/sso/saml2', (schema) => {
        const json = schema.organizationSsos.first().toJSON();

        return { ...json, enabled: false };
      });

      this.server.get('/v2/sso/saml2/metadata', () => {
        return this.metadata;
      });

      this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
        return this.idpMetadata;
      });

      this.server.delete('/organizations/:id/sso/saml2/idp_metadata', () => {
        return fail ? new Response(500) : {};
      });

      await render(hbs`<SsoSettings @organization={{this.organization}} />`);

      assert
        .dom('[data-test-ssoSetting-ssoSwitch] input')
        .isNotDisabled()
        .isNotChecked();

      assert.dom('[data-test-ssoSetting-idpDeleteBtn]').isNotDisabled();

      await click('[data-test-ssoSetting-idpDeleteBtn]');

      assert.dom('[data-test-ak-modal-header]').hasText('t:confirm:()');

      assert
        .dom('[data-test-confirmbox-description]')
        .hasText('Are you sure you want to delete IdP configuration ?');

      assert
        .dom('[data-test-confirmbox-confirmBtn]')
        .isNotDisabled()
        .hasText('t:delete:()');

      assert
        .dom('[data-test-confirmbox-cancelBtn]')
        .isNotDisabled()
        .hasText('t:cancel:()');

      await click('[data-test-confirmbox-confirmBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.ok(notify.errorMsg);
        assert.dom('[data-test-ak-modal-header]').exists();
        assert.dom('[data-test-confirmbox-description]').exists();
        assert.dom('[data-test-confirmbox-confirmBtn]').exists();
        assert.dom('[data-test-confirmbox-cancelBtn]').exists();
      } else {
        assert.strictEqual(
          notify.successMsg,
          'Deleted IdP Metadata Config successfully'
        );

        assert.dom('[data-test-ak-modal-header]').doesNotExist();
        assert.dom('[data-test-confirmbox-description]').doesNotExist();
        assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
        assert.dom('[data-test-confirmbox-cancelBtn]').doesNotExist();
      }
    }
  );

  test.each(
    'it should enable sso in sso-settings',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const organization = this.owner.lookup('service:organization').selected;

      this.setProperties({ organization });

      this.server.get('/organizations/:id/sso/saml2', (schema) => {
        const json = schema.organizationSsos.first().toJSON();

        return { ...json, enabled: false };
      });

      this.server.put('/organizations/:id/sso/saml2', () => {
        return fail ? new Response(500) : {};
      });

      this.server.get('/v2/sso/saml2/metadata', () => {
        return this.metadata;
      });

      this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
        return this.idpMetadata;
      });

      await render(hbs`<SsoSettings @organization={{this.organization}} />`);

      assert
        .dom('[data-test-ssoSetting-ssoSwitch] input')
        .isNotDisabled()
        .isNotChecked();

      assert.dom('[data-test-ssoSetting-ssoEnforceLabel]').doesNotExist();
      assert.dom('[data-test-ssoSetting-ssoEnforceCheckbox]').doesNotExist();
      assert.dom('[data-test-ssoSetting-ssoEnforceDesc]').doesNotExist();

      await click('[data-test-ssoSetting-ssoSwitch] input');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.ok(notify.errorMsg);
      } else {
        assert.strictEqual(notify.successMsg, 'SSO authentication enabled');

        assert
          .dom('[data-test-ssoSetting-ssoSwitch] input')
          .isNotDisabled()
          .isChecked();

        assert
          .dom(
            '[data-test-ssoSetting-ssoEnforceLabel] [data-test-ak-form-label]'
          )
          .hasText('t:ssoEnforce:()');

        assert.dom('[data-test-ssoSetting-ssoEnforceCheckbox]').isNotDisabled();

        assert
          .dom('[data-test-ssoSetting-ssoEnforceDesc]')
          .hasText('(t:ssoEnforceDesc:())');
      }
    }
  );

  test.each(
    'it should enable enforce sso in sso-settings',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const organization = this.owner.lookup('service:organization').selected;

      this.setProperties({ organization });

      this.server.get('/organizations/:id/sso/saml2', (schema) => {
        const json = schema.organizationSsos.first().toJSON();

        return { ...json, enabled: true, enforced: false };
      });

      this.server.put('/organizations/:id/sso/saml2', () => {
        return fail ? new Response(500) : {};
      });

      this.server.get('/v2/sso/saml2/metadata', () => {
        return this.metadata;
      });

      this.server.get('/organizations/:id/sso/saml2/idp_metadata', () => {
        return this.idpMetadata;
      });

      await render(hbs`<SsoSettings @organization={{this.organization}} />`);

      assert
        .dom('[data-test-ssoSetting-ssoEnforceLabel] [data-test-ak-form-label]')
        .hasText('t:ssoEnforce:()');

      assert
        .dom('[data-test-ssoSetting-ssoEnforceCheckbox]')
        .isNotDisabled()
        .isNotChecked();

      assert
        .dom('[data-test-ssoSetting-ssoEnforceDesc]')
        .hasText('(t:ssoEnforceDesc:())');

      await click('[data-test-ssoSetting-ssoEnforceCheckbox]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.ok(notify.errorMsg);
      } else {
        assert.strictEqual(notify.successMsg, 'SSO enforce turned ON');

        assert
          .dom('[data-test-ssoSetting-ssoEnforceCheckbox]')
          .isNotDisabled()
          .isChecked();
      }
    }
  );
});
