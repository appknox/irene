import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';

class OrganizationStub extends Service {
  selected = { id: 42 };
  isCyodEnabled = true;
  isCyodRegistrationEnabled = true;
}

class NotificationsStub extends Service {
  success() {}
  error() {}
}

// The modal opens on the Add tab; the cert list lives behind the second tab.
// AkTabs puts the test attribute on the wrapping <li> and the click handler on
// the inner <button>, so the button is what has to be clicked.
async function openExistingTab() {
  await click('[data-test-orgSigningCert-openBtn]');
  await click('[data-test-orgSigningCert-existingTab] button');
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

    test('it renders the panel header and add button', async function (assert) {
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

    test('it opens on the add tab with save disabled until both files are chosen', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve(null);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await click('[data-test-orgSigningCert-openBtn]');

      assert.dom('[data-test-orgSigningCert-tabs]').exists();
      assert.dom('[data-test-orgSigningCert-p12]').exists();
      assert.dom('[data-test-orgSigningCert-profile]').exists();
      assert.dom('[data-test-orgSigningCert-tip]').exists();

      assert
        .dom('[data-test-orgSigningCert-uploadBtn]')
        .isDisabled('a .p12 and a .mobileprovision are both required');
    });

    test('a chosen file becomes a removable chip', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve(null);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await click('[data-test-orgSigningCert-openBtn]');

      assert.dom('[data-test-orgSigningCert-p12Chip]').doesNotExist();
      assert.dom('[data-test-orgSigningCert-p12]').exists();

      const file = new File(['x'], 'identity.p12');
      await triggerEvent('[data-test-orgSigningCert-p12]', 'change', {
        files: [file],
      });

      assert
        .dom('[data-test-orgSigningCert-p12Chip]')
        .containsText('identity.p12');

      assert
        .dom('[data-test-orgSigningCert-p12]')
        .doesNotExist('the picker is replaced by the chip');

      await click('[data-test-orgSigningCert-p12Clear]');

      assert.dom('[data-test-orgSigningCert-p12Chip]').doesNotExist();

      assert
        .dom('[data-test-orgSigningCert-p12]')
        .exists('clearing brings the picker back');
    });

    test('it shows the empty state on the existing tab when no certificate is configured', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve(null);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await openExistingTab();

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
      await openExistingTab();

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
      await openExistingTab();

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
      await openExistingTab();
      await click('[data-test-orgSigningCert-activateBtn]');
    });

    test('project scope shows its single cert with no activate action', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve({
            id: 7,
            name: 'Project cert',
            team_id: 'AB12CD34',
            app_id: 'com.acme.app',
            provisioned_udids: [],
            is_expired: false,
          });
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      this.project = { id: 9, platform: 1 };

      await render(
        hbs`<Organization::SigningCertificate @project={{this.project}} />`
      );

      assert
        .dom('[data-test-orgSigningCert-sectionTitle]')
        .exists('project settings gets the CYOD section heading');

      await openExistingTab();

      assert.dom('[data-test-orgSigningCert-info]').exists({ count: 1 });

      assert
        .dom('[data-test-orgSigningCert-activateBtn]')
        .doesNotExist('nothing to switch between in project scope');

      assert.dom('[data-test-orgSigningCert-deleteBtn]').exists({ count: 1 });
    });

    test('it is hidden when the owner turns CYOD registration off', async function (assert) {
      class RegistrationOffOrganizationStub extends Service {
        selected = { id: 42 };
        isCyodEnabled = true;
        isCyodRegistrationEnabled = false;
      }

      this.owner.unregister('service:organization');
      this.owner.register('service:organization', RegistrationOffOrganizationStub);

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

    test('it is hidden when the CYOD feature is disabled', async function (assert) {
      class CyodDisabledOrganizationStub extends Service {
        selected = { id: 42 };
        isCyodEnabled = false;
        isCyodRegistrationEnabled = false;
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
