import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click, fillIn, findAll, waitFor } from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import { Response } from 'miragejs';
import Service from '@ember/service';

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

class PrivacyModuleStub extends Service {
  updatedSettings = {};
}

module('Integration | Component | privacy/settings/pii', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:privacy-module', PrivacyModuleStub);

    this.server.get('/v2/privacy_pii_settings', () => {
      return {
        id: 1,
        mask_pii: false,
        pii_settings: [
          { value: true, settings_parameter: 'pii_person' },
          { value: false, settings_parameter: 'pii_location' },
        ],
        version: 1,
        custom_regex: ['regex1', 'regex2'],
      };
    });
  });

  test('it renders initial pii settings correctly', async function (assert) {
    await render(hbs`<PrivacyModule::Settings::Pii />`);

    assert
      .dom('[data-test-privacy-settings-pii-toggle-header]')
      .hasText(t('privacyModule.piiVisibility'));

    assert
      .dom('[data-test-privacy-settings-pii-types-header]')
      .hasText(t('privacyModule.defaultPiiDetected'));

    assert
      .dom('[data-test-privacy-settings-pii-regex-header]')
      .hasText(t('privacyModule.addPiiPattern'));

    assert.dom('[data-test-privacy-settings-pii-regex-chip="0"]').exists();
    assert.dom('[data-test-privacy-settings-pii-regex-chip="1"]').exists();

    assert.dom('[data-test-privacy-settings-save-button]').isDisabled();
  });

  test('it toggles mask pii', async function (assert) {
    await render(hbs`<PrivacyModule::Settings::Pii />`);

    await click('[data-test-privacy-settings-pii-toggle]');

    const maskPiiToggle = '[data-test-privacy-settings-pii-toggle] input';

    assert.dom(maskPiiToggle).isChecked();

    await click(maskPiiToggle);

    assert.dom(maskPiiToggle).isNotChecked();
  });

  test('it toggles default pii checkbox', async function (assert) {
    await render(hbs`<PrivacyModule::Settings::Pii />`);

    assert
      .dom('[data-test-privacy-settings-pii-checkbox="pii_location"]')
      .isNotChecked();

    assert
      .dom('[data-test-privacy-settings-pii-checkbox="pii_person"]')
      .isChecked();

    await click('[data-test-privacy-settings-pii-checkbox="pii_person"]');

    await click('[data-test-privacy-settings-pii-checkbox="pii_location"]');

    assert
      .dom('[data-test-privacy-settings-pii-checkbox="pii_location"]')
      .isChecked();

    assert
      .dom('[data-test-privacy-settings-pii-checkbox="pii_person"]')
      .isNotChecked();
  });

  test('it adds new regex', async function (assert) {
    await render(hbs`<PrivacyModule::Settings::Pii />`);

    let chips = findAll('[data-test-privacy-settings-pii-regex-chip]');

    assert.strictEqual(chips.length, 2);

    await fillIn('[data-test-privacy-settings-pii-regex-input]', 'new_regex');

    await click('[data-test-privacy-settings-add-regex-button]');

    chips = findAll('[data-test-privacy-settings-pii-regex-chip]');

    assert.strictEqual(chips.length, 3);
  });

  test('it deletes regex', async function (assert) {
    await render(hbs`<PrivacyModule::Settings::Pii />`);

    let chips = findAll('[data-test-privacy-settings-pii-regex-chip]');

    assert.strictEqual(chips.length, 2);

    await click('[data-test-privacy-settings-pii-regex-chip="0"] button');

    chips = findAll('[data-test-privacy-settings-pii-regex-chip]');

    assert.strictEqual(chips.length, 1);
  });

  test('it saves settings successfully', async function (assert) {
    const service = this.owner.lookup('service:privacy-module');
    service.updatedSettings = { mask_pii: true };

    this.server.put('/v2/privacy_pii_settings/:id', () => {
      return {};
    });

    await render(hbs`<PrivacyModule::Settings::Pii />`);

    assert.dom('[data-test-privacy-settings-save-button]').isEnabled();

    await click('[data-test-privacy-settings-save-button]');

    assert.dom('[data-test-privacy-settings-save-loader]').exists();

    await waitFor('[data-test-privacy-settings-save-button]');

    const notifications = this.owner.lookup('service:notifications');

    assert.strictEqual(notifications.successMsg, t('successfullySaved'));
  });

  test('it restores original state on cancel', async function (assert) {
    await render(hbs`<PrivacyModule::Settings::Pii />`);

    await waitFor('[data-test-privacy-settings-pii-regex-chip="0"]');

    const maskPiiToggle = '[data-test-privacy-settings-pii-toggle] input';

    // Make changes: toggle mask PII, uncheck pii_person, add regex
    await click(maskPiiToggle);

    await click('[data-test-privacy-settings-pii-checkbox="pii_person"]');

    await fillIn('[data-test-privacy-settings-pii-regex-input]', 'new_pattern');

    await click('[data-test-privacy-settings-add-regex-button]');

    await click('[data-test-privacy-settings-cancel-button]');

    // Verify state restored (original: mask_pii false = toggle checked, pii_person checked, 2 regex chips)
    assert.dom(maskPiiToggle).isChecked();

    assert
      .dom('[data-test-privacy-settings-pii-checkbox="pii_person"]')
      .isChecked();

    assert.strictEqual(
      findAll('[data-test-privacy-settings-pii-regex-chip]').length,
      2
    );

    assert.dom('[data-test-privacy-settings-save-button]').isDisabled();
  });

  test('it shows error when adding duplicate regex', async function (assert) {
    await render(hbs`<PrivacyModule::Settings::Pii />`);

    await fillIn('[data-test-privacy-settings-pii-regex-input]', 'regex1');
    await click('[data-test-privacy-settings-add-regex-button]');

    const notifications = this.owner.lookup('service:notifications');

    assert.strictEqual(
      notifications.errorMsg,
      t('privacyModule.patternAlreadyExists')
    );
  });

  test('it shows error when save fails', async function (assert) {
    const service = this.owner.lookup('service:privacy-module');
    service.updatedSettings = { mask_pii: true };

    this.server.put('/v2/privacy_pii_settings/:id', () => {
      return new Response(400, {}, { detail: t('pleaseTryAgain') });
    });

    await render(hbs`<PrivacyModule::Settings::Pii />`);

    await click('[data-test-privacy-settings-save-button]');

    await waitFor('[data-test-privacy-settings-save-button]');

    const notifications = this.owner.lookup('service:notifications');

    assert.strictEqual(notifications.errorMsg, t('pleaseTryAgain'));
  });
});
