import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

class NotificationsStub extends Service {
  success() {}
  error() {}
}

/**
 * Registers an organization service whose `selected` is a mirage-created
 * organization, so the device-table URLs it drives point at a real record.
 */
function setupOrganization(
  context,
  { registrationEnabled = true, cyodEnabled = true } = {}
) {
  const organization = context.server.create('organization');

  class OrganizationStub extends Service {
    selected = organization;
    isCyodEnabled = cyodEnabled;
    isCyodRegistrationEnabled = registrationEnabled;
  }

  context.owner.register('service:organization', OrganizationStub);
  context.organization = organization;

  return organization;
}

/**
 * Registers a `me` whose org membership carries the given role trait. Only the
 * owner can flip the CYOD switch, so the role decides which notice they get.
 */
function setupMe(context, ...traits) {
  const orgMe = context.server.create('organization-me', ...traits);

  class MeStub extends Service {
    org = orgMe;
  }

  context.owner.unregister('service:me');
  context.owner.register('service:me', MeStub);

  return orgMe;
}

module(
  'Integration | Component | account-settings/cyod-settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);

      setupMe(this, 'member');
    });

    test('it renders the registration section and the connected-device table', async function (assert) {
      setupOrganization(this);

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert
        .dom('[data-test-cyodSettings-registerTitle]')
        .hasText(t('cyod.settings.deviceRegistration'));

      assert.dom('[data-test-cyodSettings-registerBtn]').isNotDisabled();

      assert
        .dom('[data-test-cyodDeviceTable-heading]')
        .hasText(t('cyod.settings.connectedDevice'));
    });

    test('the switch being off replaces the whole surface with a notice', async function (assert) {
      setupOrganization(this, { registrationEnabled: false });

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert.dom('[data-test-cyodSettings-disabled]').exists();
      assert.dom('[data-test-cyodSettings-disabledSvg]').exists();

      assert
        .dom('[data-test-cyodSettings-disabledTitle]')
        .hasText(t('cyod.settings.turnOnTitle'));

      assert
        .dom('[data-test-cyodSettings-disabledDesc]')
        .hasText(
          t('cyod.settings.turnOnDesc'),
          'a member is told to ask the owner — they cannot flip the switch'
        );

      // Nothing actionable is left on the page — a disabled button over an
      // empty table would just be dead weight.
      assert.dom('[data-test-cyodSettings-registerBtn]').doesNotExist();
      assert.dom('[data-test-cyodDeviceTable]').doesNotExist();

      // The heading stays so the tab still identifies itself.
      assert
        .dom('[data-test-cyodSettings-title]')
        .hasText(t('cyod.registration.title'));
    });

    test('the owner is pointed at organization settings instead', async function (assert) {
      setupOrganization(this, { registrationEnabled: false });
      setupMe(this, 'owner');

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert
        .dom('[data-test-cyodSettings-disabledDesc]')
        .hasText(
          t('cyod.settings.turnOnDescOwner'),
          'the owner owns the switch, so telling them to contact an owner is useless'
        );
    });

    test('an admin is told to ask the owner', async function (assert) {
      // is_admin and is_owner are independent flags — an admin cannot flip the
      // switch, so they get the same notice as a member.
      setupOrganization(this, { registrationEnabled: false });
      setupMe(this, 'admin');

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert
        .dom('[data-test-cyodSettings-disabledDesc]')
        .hasText(t('cyod.settings.turnOnDesc'));
    });

    test('the empty hint emphasises the register action as markup', async function (assert) {
      setupOrganization(this);

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert
        .dom('[data-test-cyodDeviceTable-emptyDescription] strong')
        .hasText('Register a device', 'renders as markup, not literal tags');
    });

    test('it renders nothing without the CYOD entitlement', async function (assert) {
      setupOrganization(this, { cyodEnabled: false });

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert
        .dom('[data-test-cyodSettings]')
        .doesNotExist('direct URL access must not surface CYOD UI');
    });

    test('it opens the five-step Mercer setup drawer', async function (assert) {
      setupOrganization(this);

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert.dom('[data-test-cyodSettings-drawer]').doesNotExist();

      await click('[data-test-cyodSettings-registerBtn]');

      assert.dom('[data-test-cyodSettings-drawer]').exists();
      assert.dom('[data-test-cyodSettings-downloadBtn]').exists();
      assert.dom('[data-test-cyodSettings-serverUrl]').exists();
      assert.dom('[data-test-cyodSettings-copyBtn]').exists();

      assert
        .dom('[data-test-cyodSettings-drawer]')
        .containsText(t('cyod.settings.stepRun'), 'renders the final step');

      // The "Note -" label is a separate bold run, so the two notes carry it
      // as markup rather than baked into the translated sentence.
      const noteLabels = this.element.querySelectorAll(
        '[data-test-cyodSettings-noteLabel]'
      );

      assert.strictEqual(noteLabels.length, 2, 'both steps carry a note label');

      assert.dom(noteLabels[0]).hasText(t('cyod.settings.noteLabel'));

      assert
        .dom('[data-test-cyodSettings-drawer]')
        .containsText(t('cyod.settings.stepCertificateNote'));

      await click('[data-test-cyodSettings-drawerCloseBtn]');

      assert.dom('[data-test-cyodSettings-drawer]').doesNotExist();
    });
  }
);
