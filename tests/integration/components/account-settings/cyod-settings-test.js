import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';
import Service from '@ember/service';

import ENV from 'irene/config/environment';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-cyodSettings]',
  title: '[data-test-cyodSettings-title]',
  registerTitle: '[data-test-cyodSettings-registerTitle]',
  registerBtn: '[data-test-cyodSettings-registerBtn]',
  step: (number) => `[data-test-cyodSettings-step='${number}']`,
  stepTitle: '[data-test-cyodSettings-stepTitle]',
  serverUrl: '[data-test-cyodSettings-serverUrl]',
  copyBtn: '[data-test-cyodSettings-copyBtn]',
  downloadBtn: '[data-test-cyodSettings-downloadBtn]',
  stepCertificateNote: '[data-test-cyodSettings-stepCertificateNote]',
  stepDownloadNote: '[data-test-cyodSettings-stepDownloadNote]',
  drawer: '[data-test-cyodSettings-drawer]',
  drawerTitle: '[data-test-cyodSettings-drawerTitle]',
  drawerCloseBtn: '[data-test-cyodSettings-drawerCloseBtn]',
  disabled: '[data-test-cyodSettings-disabled]',
  disabledSvg: '[data-test-cyodSettings-disabledSvg]',
  disabledTitle: '[data-test-cyodSettings-disabledTitle]',
  disabledDesc: '[data-test-cyodSettings-disabledDesc]',
  deviceTable: '[data-test-cyodDeviceTable]',
  deviceTableHeading: '[data-test-cyodDeviceTable-heading]',
  deviceTableEmptyDescription: '[data-test-cyodDeviceTable-emptyDescription]',
};

// ─── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<AccountSettings::CyodSettings />`;

class NotificationsStub extends Service {
  successMsg = null;
  errorMsg = null;

  success(msg) {
    this.successMsg = msg;
  }

  error(msg) {
    this.errorMsg = msg;
  }

  setDefaultAutoClear() {}
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

      this.notify = this.owner.lookup('service:notifications');

      setupMe(this, 'withMemberRole');
    });

    test('it renders the registration section and the connected-device table', async function (assert) {
      setupOrganization(this);

      await render(TEMPLATE);

      assert
        .dom(selectors.registerTitle)
        .hasText(t('cyod.settings.deviceRegistration'));

      assert.dom(selectors.registerBtn).isNotDisabled();

      assert
        .dom(selectors.deviceTableHeading)
        .hasText(t('cyod.settings.connectedDevice'));
    });

    test('the switch being off replaces the whole surface with a notice', async function (assert) {
      setupOrganization(this, { registrationEnabled: false });

      await render(TEMPLATE);

      assert.dom(selectors.disabled).exists();
      assert.dom(selectors.disabledSvg).exists();

      assert
        .dom(selectors.disabledTitle)
        .hasText(t('cyod.settings.turnOnTitle'));

      assert
        .dom(selectors.disabledDesc)
        .hasText(
          t('cyod.settings.turnOnDesc'),
          'a member is told to ask the owner — they cannot flip the switch'
        );

      // Nothing actionable is left on the page — a disabled button over an
      // empty table would just be dead weight.
      assert.dom(selectors.registerBtn).doesNotExist();
      assert.dom(selectors.deviceTable).doesNotExist();

      // The heading stays so the tab still identifies itself.
      assert.dom(selectors.title).hasText(t('cyod.registration.title'));
    });

    test('the owner is pointed at organization settings instead', async function (assert) {
      setupOrganization(this, { registrationEnabled: false });
      setupMe(this, 'withOwnerRole');

      await render(TEMPLATE);

      assert
        .dom(selectors.disabledDesc)
        .hasText(
          t('cyod.settings.turnOnDescOwner'),
          'the owner owns the switch, so telling them to contact an owner is useless'
        );
    });

    test('an admin is told to ask the owner', async function (assert) {
      // is_admin and is_owner are independent flags — an admin cannot flip the
      // switch, so they get the same notice as a member.
      setupOrganization(this, { registrationEnabled: false });
      setupMe(this, 'withAdminRole');

      await render(TEMPLATE);

      assert.dom(selectors.disabledDesc).hasText(t('cyod.settings.turnOnDesc'));
    });

    test('the empty hint emphasises the register action as markup', async function (assert) {
      setupOrganization(this);

      await render(TEMPLATE);

      assert
        .dom('[data-test-cyodDeviceTable-emptyDescription] strong')
        .hasText('Register a device', 'renders as markup, not literal tags');
    });

    test('it renders nothing without the CYOD entitlement', async function (assert) {
      setupOrganization(this, { cyodEnabled: false });

      await render(TEMPLATE);

      assert
        .dom(selectors.root)
        .doesNotExist('direct URL access must not surface CYOD UI');
    });

    test('the drawer titles each of the five setup steps in order', async function (assert) {
      setupOrganization(this);

      await render(TEMPLATE);
      await click(selectors.registerBtn);

      const titles = findAll(selectors.stepTitle);
      const expected = [
        t('cyod.settings.stepCertificate'),
        t('cyod.settings.stepDownload'),
        t('cyod.settings.stepSignIn'),
        t('cyod.settings.stepRegister'),
        t('cyod.settings.stepRun'),
      ];

      assert.strictEqual(titles.length, expected.length);

      expected.forEach((title, index) => {
        assert.dom(titles[index]).hasText(title);
        assert.dom(selectors.step(index + 1)).exists();
      });

      assert
        .dom(selectors.drawerTitle)
        .hasText(t('cyod.settings.registerADevice'));
    });

    test('the drawer offers the Mercer download and the server URL to copy', async function (assert) {
      setupOrganization(this);

      await render(TEMPLATE);
      await click(selectors.registerBtn);

      assert
        .dom(selectors.downloadBtn)
        .hasText(t('cyod.settings.downloadMercer'))
        .hasAttribute('href', ENV.mercerDownloadUrl)
        .hasAttribute('target', '_blank')
        .hasAttribute('rel', 'noopener noreferrer');

      assert
        .dom(selectors.serverUrl)
        .hasText(ENV.host || window.location.origin);

      assert
        .dom(selectors.copyBtn)
        .hasAttribute(
          'data-clipboard-text',
          ENV.host || window.location.origin,
          'copies the same host it displays'
        );
    });

    test('copying the server URL confirms it was copied', async function (assert) {
      setupOrganization(this);

      await render(TEMPLATE);
      await click(selectors.registerBtn);

      assert.strictEqual(this.notify.successMsg, null);

      await click(selectors.copyBtn);

      assert.strictEqual(
        this.notify.successMsg,
        t('copiedToClipboard'),
        'confirms the copy so the user knows it landed'
      );
    });

    test('it opens the five-step Mercer setup drawer', async function (assert) {
      assert.expect(9);

      setupOrganization(this);

      await render(TEMPLATE);

      assert.dom(selectors.drawer).doesNotExist();

      await click(selectors.registerBtn);

      assert.dom(selectors.drawer).exists();
      assert.dom(selectors.downloadBtn).exists();
      assert.dom(selectors.serverUrl).exists();
      assert.dom(selectors.copyBtn).exists();

      assert
        .dom(selectors.drawer)
        .containsText(t('cyod.settings.stepRun'), 'renders the final step');

      // Both notes carry their "Note -" label as markup inside the translation.
      compareInnerHTMLWithIntlTranslation(assert, {
        selector: selectors.stepCertificateNote,
        message: t('cyod.settings.stepCertificateNote'),
      });

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: selectors.stepDownloadNote,
        message: t('cyod.settings.stepDownloadNote'),
      });

      await click(selectors.drawerCloseBtn);

      assert.dom(selectors.drawer).doesNotExist();
    });
  }
);
