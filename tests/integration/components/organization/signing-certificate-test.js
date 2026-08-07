import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerEvent, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
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

// The drawer opens on the Add tab; the cert list lives behind the second tab.
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

      // The panel header takes an opt-in measure for its description; without
      // it the sentence runs the full width of the settings card.
      const description = this.element.querySelector(
        '[data-test-orgSettingsPanelHeader-description]'
      );

      assert.strictEqual(
        window.getComputedStyle(description).maxWidth,
        '620px',
        'certificate description keeps the design measure'
      );
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

      // Design spec for the drawer. These are computed-style checks because
      // the values sit off the AkTypography/AkStack ramps and are applied by
      // local classes that lose the cascade tie unless out-specified.
      const style = (selector) =>
        window.getComputedStyle(this.element.querySelector(selector));

      const tip = style('[data-test-orgSigningCert-tip] p');

      assert.strictEqual(
        Math.round(parseFloat(tip.fontSize)),
        12,
        'tip text is 12px'
      );

      assert.strictEqual(
        style('[data-test-orgSigningCert-tip]').borderRadius,
        '4px',
        'tip is rounded on all four corners'
      );

      assert.strictEqual(
        style('[data-test-orgSigningCert-tip]').borderLeftWidth,
        '4px',
        'accent bar is 4px'
      );

      assert.strictEqual(
        style(
          '[data-test-orgSigningCert-name] ~ * [data-test-form-label], ' +
            '[data-test-orgSigningCert-drawer] [data-test-form-label]'
        ).fontWeight,
        '600',
        'input labels are medium'
      );

      // Two rules: after the tip, and between the p12 password and the profile.
      assert
        .dom('[data-test-orgSigningCert-drawer] [data-test-ak-divider]')
        .exists({ count: 2 });

      // The password sits in the left column, level with Name above it,
      // rather than spanning the drawer.
      const columnWidth = (selector) =>
        window.getComputedStyle(
          this.element.querySelector(selector).closest('div').parentElement
        ).width;

      assert.strictEqual(
        columnWidth('[data-test-orgSigningCert-password]'),
        columnWidth('[data-test-orgSigningCert-name]'),
        'password field matches the Name column width'
      );

      await click('[data-test-orgSigningCert-drawerCloseBtn]');

      assert.dom('[data-test-orgSigningCert-drawer]').doesNotExist();
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

      // Design spec for the selected state: white rather than the grey fill,
      // on the wider 8px radius, with the name a step up from the picker row.
      const chip = this.element.querySelector(
        '[data-test-orgSigningCert-p12Chip]'
      );

      const chipStyle = window.getComputedStyle(chip);

      assert.strictEqual(chipStyle.backgroundColor, 'rgb(255, 255, 255)');
      assert.strictEqual(chipStyle.borderRadius, '8px');

      assert.strictEqual(
        window.getComputedStyle(chip.querySelector('p')).fontSize,
        '14px',
        'the chosen name reads as a value, not helper text'
      );

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

    test('it formats the expiry rather than showing the raw timestamp', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve([
            {
              id: 1,
              name: 'Acme iOS',
              team_id: 'AB12CD34',
              is_active: true,
              provisioned_udids: [],
              is_expired: false,
              expires_at: '2027-07-03T13:49:03Z',
            },
          ]);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await openExistingTab();

      assert
        .dom('[data-test-orgSigningCert-info]')
        .doesNotContainText('2027-07-03T13:49:03Z', 'no raw ISO string');

      assert
        .dom('[data-test-orgSigningCert-info]')
        .containsText('July 3, 2027');
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

    test('deleting asks for confirmation before calling the endpoint', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve([
            {
              id: 1,
              name: 'cyod_xcode_9thjuly',
              team_id: 'AB12CD34',
              is_active: false,
              provisioned_udids: [],
            },
          ]);
        }
        delete() {
          assert.step('delete called');

          return Promise.resolve({});
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await openExistingTab();

      await click('[data-test-orgSigningCert-deleteBtn]');

      // Deleting is irreversible, so the click stages a confirmation rather
      // than hitting the endpoint.
      assert.verifySteps([], 'the trash icon alone deletes nothing');

      assert.dom('[data-test-orgSigningCert-deleteConfirm]').exists();
      assert.dom('[data-test-orgSigningCert-tabs]').doesNotExist();

      assert
        .dom('[data-test-orgSigningCert-deleteConfirmTitle]')
        .containsText('cyod_xcode_9thjuly', 'names the cert being deleted');

      // Backing out leaves the certificate alone.
      await click('[data-test-orgSigningCert-deleteCancelBtn]');

      assert.verifySteps([], 'cancelling deletes nothing');
      assert.dom('[data-test-orgSigningCert-deleteConfirm]').doesNotExist();
      assert
        .dom('[data-test-orgSigningCert-tabs]')
        .exists('returns to the list');

      await click('[data-test-orgSigningCert-deleteBtn]');
      await click('[data-test-orgSigningCert-deleteConfirmBtn]');

      assert.verifySteps(['delete called'], 'confirming runs the delete');
      assert.dom('[data-test-orgSigningCert-deleteConfirm]').doesNotExist();
    });

    test('the back arrow returns from the confirmation to the list', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve([
            { id: 1, name: 'One', team_id: 'AB12CD34', provisioned_udids: [] },
          ]);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::SigningCertificate />`);
      await openExistingTab();
      await click('[data-test-orgSigningCert-deleteBtn]');

      assert
        .dom('[data-test-orgSigningCert-drawerTitle]')
        .hasText(t('confirmation'));

      await click('[data-test-orgSigningCert-deleteBackBtn]');

      assert.dom('[data-test-orgSigningCert-deleteConfirm]').doesNotExist();
      assert.dom('[data-test-orgSigningCert-tabs]').exists();
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

    test('it emits no section layout of its own', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve(null);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      this.project = { id: 9, platform: 1 };

      await render(
        hbs`<Organization::SigningCertificate @project={{this.project}} />`
      );

      // The divider, width and padding that place this inside the project's
      // General Settings card belong to the caller, alongside where its Teams
      // and Collaborators siblings declare theirs.
      assert
        .dom('[data-test-ak-divider]')
        .doesNotExist('the caller owns the section divider');

      // The CYOD heading has to sit level with the Teams and Collaborators
      // headings, which are h5. Typography classes are hashed, so match the
      // pattern rather than the exact name.
      assert.ok(
        /ak-typography-h5/.test(
          find('[data-test-orgSigningCert-sectionTitle]').className
        ),
        'section heading matches its h5 siblings'
      );
    });

    test('it hides itself for a non-iOS project', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve(null);
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      // Android project — iOS signing certs do not apply.
      this.project = { id: 9, platform: 0 };

      await render(
        hbs`<Organization::SigningCertificate @project={{this.project}} />`
      );

      assert.dom('[data-test-orgSigningCert]').doesNotExist();
    });

    test('it is hidden when the owner turns CYOD registration off', async function (assert) {
      class RegistrationOffOrganizationStub extends Service {
        selected = { id: 42 };
        isCyodEnabled = true;
        isCyodRegistrationEnabled = false;
      }

      this.owner.unregister('service:organization');
      this.owner.register(
        'service:organization',
        RegistrationOffOrganizationStub
      );

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
