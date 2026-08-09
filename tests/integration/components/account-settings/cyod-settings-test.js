import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

function organizationStub({
  registrationEnabled = true,
  cyodEnabled = true,
} = {}) {
  return class OrganizationStub extends Service {
    selected = { id: 42 };
    isCyodEnabled = cyodEnabled;
    isCyodRegistrationEnabled = registrationEnabled;
  };
}

class NotificationsStub extends Service {
  success() {}
  error() {}
}

class EmptyAjaxStub extends Service {
  request() {
    return Promise.resolve({ results: [] });
  }
}

module(
  'Integration | Component | account-settings/cyod-settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:ajax', EmptyAjaxStub);
    });

    test('it renders the registration section and the connected-device table', async function (assert) {
      this.owner.register('service:organization', organizationStub());

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert
        .dom('[data-test-cyodSettings-registerTitle]')
        .hasText(t('cyodSettings.deviceRegistration'));

      assert.dom('[data-test-cyodSettings-registerBtn]').isNotDisabled();

      assert
        .dom('[data-test-cyodDeviceTable-heading]')
        .hasText(t('cyodSettings.connectedDevice'));
    });

    test('the switch being off replaces the whole surface with a notice', async function (assert) {
      this.owner.register(
        'service:organization',
        organizationStub({ registrationEnabled: false })
      );

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert.dom('[data-test-cyodSettings-disabled]').exists();
      assert.dom('[data-test-cyodSettings-disabledSvg]').exists();

      assert
        .dom('[data-test-cyodSettings-disabledTitle]')
        .hasText(t('cyodSettings.turnOnTitle'));

      assert
        .dom('[data-test-cyodSettings-disabledDesc]')
        .hasText(t('cyodSettings.turnOnDesc'));

      // Nothing actionable is left on the page — a disabled button over an
      // empty table would just be dead weight.
      assert.dom('[data-test-cyodSettings-registerBtn]').doesNotExist();
      assert.dom('[data-test-cyodDeviceTable]').doesNotExist();

      // The heading stays so the tab still identifies itself.
      assert
        .dom('[data-test-cyodSettings-title]')
        .hasText(t('cyodRegistration.title'));
    });

    test('the empty hint emphasises the register action as markup', async function (assert) {
      this.owner.register('service:organization', organizationStub());

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert
        .dom('[data-test-cyodDeviceTable-emptyDescription] strong')
        .hasText('Register a device', 'renders as markup, not literal tags');
    });

    test('it renders nothing without the CYOD entitlement', async function (assert) {
      this.owner.register(
        'service:organization',
        organizationStub({ cyodEnabled: false })
      );

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert
        .dom('[data-test-cyodSettings]')
        .doesNotExist('direct URL access must not surface CYOD UI');
    });

    test('it opens the five-step Mercer setup drawer', async function (assert) {
      this.owner.register('service:organization', organizationStub());

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert.dom('[data-test-cyodSettings-drawer]').doesNotExist();

      await click('[data-test-cyodSettings-registerBtn]');

      assert.dom('[data-test-cyodSettings-drawer]').exists();
      assert.dom('[data-test-cyodSettings-downloadBtn]').exists();
      assert.dom('[data-test-cyodSettings-serverUrl]').exists();
      assert.dom('[data-test-cyodSettings-copyBtn]').exists();

      assert
        .dom('[data-test-cyodSettings-drawer]')
        .containsText(t('cyodSettings.stepRun'), 'renders the final step');

      // The "Note -" label is a separate bold run, so the two notes carry it
      // as markup rather than baked into the translated sentence.
      const noteLabels = this.element.querySelectorAll(
        '[data-test-cyodSettings-noteLabel]'
      );

      assert.strictEqual(noteLabels.length, 2, 'both steps carry a note label');

      assert.dom(noteLabels[0]).hasText(t('cyodSettings.noteLabel'));

      assert.ok(
        parseInt(window.getComputedStyle(noteLabels[0]).fontWeight, 10) >= 700,
        'the label renders bold'
      );

      assert
        .dom('[data-test-cyodSettings-drawer]')
        .containsText(t('cyodSettings.stepCertificateNote'));

      // The server URL sits off the AkTypography size ramp, so its style comes
      // from a local class that has to out-specify the component's own rules.
      // A plain single-class selector loses that tie and silently does
      // nothing, which is invisible in markup-only assertions.
      const urlStyle = window.getComputedStyle(
        this.element.querySelector('[data-test-cyodSettings-serverUrl]')
      );

      assert.strictEqual(
        Math.round(parseFloat(urlStyle.fontSize)),
        12,
        'server URL renders at 12px'
      );

      assert.ok(
        urlStyle.fontFamily.includes('DM Mono'),
        `server URL renders in DM Mono, got ${urlStyle.fontFamily}`
      );

      await click('[data-test-cyodSettings-drawerCloseBtn]');

      assert.dom('[data-test-cyodSettings-drawer]').doesNotExist();
    });
  }
);
