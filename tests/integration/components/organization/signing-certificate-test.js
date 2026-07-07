import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';

class OrganizationStub extends Service {
  selected = { id: 42 };
}

class NotificationsStub extends Service {
  success() {}
  error() {}
}

module(
  'Integration | Component | organization/signing-certificate',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:organization', OrganizationStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders the panel header and manage button', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve(null);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);

      assert.dom('[data-test-orgSigningCert-title]').exists();
      assert.dom('[data-test-orgSigningCert-openBtn]').exists();
    });

    test('it shows the empty state when no certificate is configured', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve(null);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await click('[data-test-orgSigningCert-openBtn]');

      assert.dom('[data-test-orgSigningCert-empty]').exists();
      assert.dom('[data-test-orgSigningCert-info]').doesNotExist();
    });

    test('it shows the certificate summary with an Active status chip', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve({
            id: 1,
            name: 'Acme iOS',
            team_id: 'AB12CD34',
            bundle_id: 'com.acme.app',
            provisions_all_devices: false,
            provisioned_udids: ['udid-1', 'udid-2'],
            expires_at: '2027-01-01',
            is_expired: false,
          });
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await click('[data-test-orgSigningCert-openBtn]');

      assert.dom('[data-test-orgSigningCert-info]').exists();
      assert.dom('[data-test-orgSigningCert-status]').hasText('Active');
      assert.dom('[data-test-orgSigningCert-empty]').doesNotExist();
    });

    test('it flags an expired certificate on the status chip', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve({
            id: 1,
            team_id: 'AB12CD34',
            provisioned_udids: [],
            is_expired: true,
          });
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await click('[data-test-orgSigningCert-openBtn]');

      assert.dom('[data-test-orgSigningCert-status]').hasText('Expired');
    });
  }
);
