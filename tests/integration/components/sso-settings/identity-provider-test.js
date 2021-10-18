import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | sso-settings/identity-provider',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    test('it should render IDP title and sub title', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<SsoSettings::IdentityProvider />`);
      assert
        .dom(`[data-test-idp-title]`)
        .hasText(`t:identityProvider:() (IdP)`);
      assert.dom(`[data-test-idp-sub-title]`).hasText(`t:idpMetadataUpload:()`);
    });

    test('it should render IDP metadata xml in editor', async function (assert) {
      this.set('idpMetadataXml', '<?xml version="1.0"?>testing');

      await render(
        hbs`<SsoSettings::IdentityProvider @idpMetadataXml={{this.idpMetadataXml}}/>`
      );
      assert
        .dom(`[data-test-idp-xml-metadata-textarea]`)
        .hasValue(this.idpMetadataXml);

      assert.dom(`[data-test-idp-metadata-details]`).doesNotExist();
      assert.dom(`[data-test-idp-xml-upload]`).doesNotExist();
    });

    test('it should render IDP metadata xml in editor', async function (assert) {
      this.set('idpMetadataXml', '<?xml version="1.0"?>testing');

      await render(
        hbs`<SsoSettings::IdentityProvider @idpMetadataXml={{this.idpMetadataXml}}/>`
      );
      assert.dom(`[data-test-idp-xml-upload]`).exists();

      assert.dom(`[data-test-idp-metadata-details]`).doesNotExist();
      assert.dom(`[data-test-idp-preview-xml]`).doesNotExist();
    });

    test('it should render IDP metadata details', async function (assert) {
      this.set('idpMetadata', {});
      await render(
        hbs`<SsoSettings::IdentityProvider @idpMetadata={{this.idpMetadata}}/>`
      );
      assert.dom(`[data-test-idp-meta-title-text]`).hasText(`IdP Metadata`);
      assert.dom(`[data-test-idp-meta-title-icon]`).exists();
      assert.dom(`[data-test-ipd-meta-delete-btn]`).exists();

      assert
        .dom(`[data-test-idp-meta-entity-id-title]`)
        .hasText(`t:entityID:()`);
      assert
        .dom(`[data-test-idp-meta-entity-id-value]`)
        .hasText(this.idpMetadata.entityId);

      assert
        .dom(`[data-test-idp-meta-sso-service-url-title]`)
        .hasText(`t:ssoServiceURL:()`);
      assert
        .dom(`[data-test-idp-meta-sso-service-url-value]`)
        .hasText(this.idpMetadata.ssoServiceUrl);

      assert
        .dom(`[data-test-idp-certificate-title-text]`)
        .hasText(`t:certificate:()`);
      assert.dom(`[data-test-idp-certificate-icon]`).exists();

      assert
        .dom(`[data-test-idp-certificate-issuer-title]`)
        .hasText(`t:issuer:()`);
      assert
        .dom(`[data-test-idp-certificate-issuer-value]`)
        .hasText(this.idpMetadata.certificate.issuer);

      assert
        .dom(`[data-test-idp-certificate-issuedon-title]`)
        .hasText(`t:issuedOn:()`);
      assert
        .dom(`[data-test-idp-certificate-issuedon-value]`)
        .hasText(this.idpMetadata.certificate.issued_on);

      assert
        .dom(`[data-test-idp-certificate-expiry-title]`)
        .hasText(`t:expiry:()`);
      assert
        .dom(`[data-test-idp-certificate-expiry-value]`)
        .hasText(this.idpMetadata.certificate.expires_on);

      assert
        .dom(`[data-test-idp-certificate-fingerprint-title]`)
        .hasText(`t:fingerprints:()`);
      assert
        .dom(`[data-test-idp-certificate-fingerprint-sha256]`)
        .hasText(`SHA256 ${this.idpMetadata.certificate.fingerprint_sha256}`);
      assert
        .dom(`[data-test-idp-certificate-fingerprint-sha1]`)
        .hasText(`SHA1 ${this.idpMetadata.certificate.fingerprint_sha1}`);

      assert.dom(`[data-test-idp-xml-upload]`).doesNotExist();
      assert.dom(`[data-test-idp-preview-xml]`).doesNotExist();
    });

    test('it should render IDP Metadata delete icon state based on sso enabled flag', async function (assert) {
      this.set('sso', { enabled: true });
      this.set('idpMetadata', {});
      await render(
        hbs`<SsoSettings::IdentityProvider @sso={{this.sso}} @idpMetadata={{this.idpMetadata}}/>`
      );
      assert.dom(`[data-test-ipd-meta-delete-btn]`).hasAttribute('disabled');

      this.set('sso', { enabled: false });

      assert
        .dom(`[data-test-ipd-meta-delete-btn]`)
        .doesNotHaveAttribute('disabled');
    });

    test('clicking at delete IPD metadata btn should fire event', async function (assert) {
      this.set('sso', { enabled: false });
      this.set('idpMetadata', {});
      this.set('onToggleDeleteIdpMetadataModal', () => {
        assert.true(1, 'Click event fired');
      });
      await render(
        hbs`<SsoSettings::IdentityProvider @sso={{this.sso}} @idpMetadata={{this.idpMetadata}}/>`
      );
      await click('[data-test-ipd-meta-delete-btn]');
    });
  }
);
