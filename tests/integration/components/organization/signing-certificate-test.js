import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';

class OrganizationStub extends Service {
  selected = { id: 42 };
  isCyodEnabled = true;
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

    test('it lists org certs and flags the active one', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve([
            {
              id: 1,
              name: 'Acme iOS',
              team_id: 'AB12CD34',
              app_id: 'com.acme.*',
              is_active: true,
              provisioned_udids: [],
              is_expired: false,
            },
            {
              id: 2,
              name: 'Foo iOS',
              team_id: 'EF56GH78',
              app_id: 'com.foo.app',
              is_active: false,
              provisioned_udids: [],
              is_expired: false,
            },
          ]);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await click('[data-test-orgSigningCert-openBtn]');

      assert.dom('[data-test-orgSigningCert-list]').exists();
      assert.dom('[data-test-orgSigningCert-info]').exists({ count: 2 });
      assert.dom('[data-test-orgSigningCert-activeBadge]').exists({ count: 1 });
      assert.dom('[data-test-orgSigningCert-activateBtn]').exists({ count: 1 });
      assert.dom('[data-test-orgSigningCert-empty]').doesNotExist();
    });

    test('it disables delete for the active cert', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve([
            {
              id: 1,
              team_id: 'AB12CD34',
              is_active: true,
              provisioned_udids: [],
              is_expired: false,
            },
            {
              id: 2,
              team_id: 'EF56GH78',
              is_active: false,
              provisioned_udids: [],
              is_expired: false,
            },
          ]);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await click('[data-test-orgSigningCert-openBtn]');

      const deleteButtons = this.element.querySelectorAll(
        '[data-test-orgSigningCert-deleteBtn]'
      );
      assert.strictEqual(deleteButtons.length, 2);
      // First row is the active cert -> its delete button is disabled.
      assert.dom(deleteButtons[0]).isDisabled();
      assert.dom(deleteButtons[1]).isNotDisabled();
    });

    test('it activates a cert via the activate endpoint', async function (assert) {
      assert.expect(1);

      class AjaxStub extends Service {
        request() {
          return Promise.resolve([
            {
              id: 1,
              team_id: 'AB12CD34',
              is_active: true,
              provisioned_udids: [],
            },
            {
              id: 2,
              team_id: 'EF56GH78',
              is_active: false,
              provisioned_udids: [],
            },
          ]);
        }
        post(url) {
          assert.true(
            url.endsWith('/signing-certificates/2/activate/'),
            'posts to the activate endpoint for the chosen cert'
          );
          return Promise.resolve({});
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await click('[data-test-orgSigningCert-openBtn]');
      await click('[data-test-orgSigningCert-activateBtn]');
    });

    test('it is hidden when the CYOD feature is disabled', async function (assert) {
      class CyodDisabledOrganizationStub extends Service {
        selected = { id: 42 };
        isCyodEnabled = false;
      }
      this.owner.unregister('service:organization');
      this.owner.register('service:organization', CyodDisabledOrganizationStub);

      class AjaxStub extends Service {
        request() {
          return Promise.resolve(null);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);

      assert.dom('[data-test-orgSigningCert-title]').doesNotExist();
      assert.dom('[data-test-orgSigningCert-openBtn]').doesNotExist();
    });
  }
);
