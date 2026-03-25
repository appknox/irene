import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click, fillIn, findAll, waitFor } from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import { Response } from 'miragejs';
import Service from '@ember/service';

class NotificationsStub extends Service {
  successMsg = null;
  errorMsg = null;

  success(msg) {
    this.successMsg = msg;
  }

  error(msg) {
    this.errorMsg = msg;
  }
}

class PrivacyModuleStub extends Service {
  updatedSettings = {};
}

module(
  'Integration | Component | privacy/settings/server-location',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:privacy-module', PrivacyModuleStub);

      // Mock GET settings
      this.server.get('/v2/privacy_geo_settings', () => {
        return {
          id: 1,
          custom_countries: ['SG', 'AU'],
          geo_settings: [
            { value: false, settings_parameter: 'geo_in' },
            { value: true, settings_parameter: 'geo_us' },
          ],
          version: 1,
        };
      });
    });

    test('it renders initial server location settings correctly', async function (assert) {
      await render(hbs`<PrivacyModule::Settings::ServerLocation />`);

      assert
        .dom('[data-test-privacy-settings-server-location-default]')
        .hasText(t('privacyModule.defaultHighRisk'));

      assert
        .dom('[data-test-privacy-settings-server-location-additional]')
        .hasText(t('privacyModule.additionalCountries'));

      // Custom country chip
      const chips = findAll(
        '[data-test-privacy-settings-server-location-regex-chip]'
      );
      assert.strictEqual(chips.length, 2);

      assert.dom('[data-test-privacy-settings-save-button]').isDisabled();

      assert.dom('[data-test-privacy-settings-cancel-button]').exists();
    });

    test('it toggles default server location checkbox', async function (assert) {
      await render(hbs`<PrivacyModule::Settings::ServerLocation />`);

      const countryTexts = findAll(
        '[data-test-privacy-settings-server-location-checkbox-text]'
      );

      assert.strictEqual(countryTexts[0].textContent.trim(), 'India');
      assert.strictEqual(countryTexts[1].textContent.trim(), 'United States');

      assert
        .dom('[data-test-privacy-settings-server-location-checkbox="geo_in"]')
        .isNotChecked();

      assert
        .dom('[data-test-privacy-settings-server-location-checkbox="geo_us"]')
        .isChecked();

      await click(
        '[data-test-privacy-settings-server-location-checkbox="geo_in"]'
      );

      await click(
        '[data-test-privacy-settings-server-location-checkbox="geo_us"]'
      );

      assert
        .dom('[data-test-privacy-settings-server-location-checkbox="geo_in"]')
        .isChecked();

      assert
        .dom('[data-test-privacy-settings-server-location-checkbox="geo_us"]')
        .isNotChecked();
    });

    test('it adds custom country', async function (assert) {
      await render(hbs`<PrivacyModule::Settings::ServerLocation />`);

      let chips = findAll(
        '[data-test-privacy-settings-server-location-regex-chip]'
      );

      assert.strictEqual(chips.length, 2);

      await fillIn(
        '[data-test-privacy-settings-server-location-additional-input]',
        'Afghanistan'
      );

      await click(
        '[data-test-privacy-settings-server-location-additional-input]'
      );

      await click('[data-test-ak-autocomplete-item]');

      chips = findAll(
        '[data-test-privacy-settings-server-location-regex-chip]'
      );

      assert.strictEqual(chips.length, 3);
    });

    test('it deletes custom country', async function (assert) {
      await render(hbs`<PrivacyModule::Settings::ServerLocation />`);

      let chips = findAll(
        '[data-test-privacy-settings-server-location-regex-chip]'
      );
      assert.strictEqual(chips.length, 2);

      await click(
        '[data-test-privacy-settings-server-location-regex-chip="0"] button'
      );

      chips = findAll(
        '[data-test-privacy-settings-server-location-regex-chip]'
      );
      assert.strictEqual(chips.length, 1);
    });

    test('it saves server location settings successfully', async function (assert) {
      const service = this.owner.lookup('service:privacy-module');
      service.updatedSettings = { geo_in: true };

      this.server.put('/v2/privacy_geo_settings/:id', () => {
        return {};
      });

      await render(hbs`<PrivacyModule::Settings::ServerLocation />`);

      assert.dom('[data-test-privacy-settings-save-button]').isEnabled();

      await click('[data-test-privacy-settings-save-button]');

      assert.dom('[data-test-privacy-settings-save-loader]').exists();

      await waitFor('[data-test-privacy-settings-save-button]');

      const notifications = this.owner.lookup('service:notifications');

      assert.strictEqual(notifications.successMsg, t('successfullySaved'));
    });

    test('it restores original state on cancel', async function (assert) {
      await render(hbs`<PrivacyModule::Settings::ServerLocation />`);

      await waitFor(
        '[data-test-privacy-settings-server-location-regex-chip="0"]'
      );

      await click(
        '[data-test-privacy-settings-server-location-checkbox="geo_in"]'
      );
      await click(
        '[data-test-privacy-settings-server-location-checkbox="geo_us"]'
      );

      await fillIn(
        '[data-test-privacy-settings-server-location-additional-input]',
        'Afghanistan'
      );
      await click(
        '[data-test-privacy-settings-server-location-additional-input]'
      );
      await click('[data-test-ak-autocomplete-item]');

      await click('[data-test-privacy-settings-cancel-button]');

      assert
        .dom('[data-test-privacy-settings-server-location-checkbox="geo_in"]')
        .isNotChecked();

      assert
        .dom('[data-test-privacy-settings-server-location-checkbox="geo_us"]')
        .isChecked();

      assert.strictEqual(
        findAll('[data-test-privacy-settings-server-location-regex-chip]')
          .length,
        2
      );

      assert.dom('[data-test-privacy-settings-save-button]').isDisabled();
    });

    test('it shows error when save fails', async function (assert) {
      const service = this.owner.lookup('service:privacy-module');
      service.updatedSettings = { geo_in: true };

      this.server.put('/v2/privacy_geo_settings/:id', () => {
        return new Response(400, {}, { detail: 'Failed, please try again' });
      });

      await render(hbs`<PrivacyModule::Settings::ServerLocation />`);

      await click('[data-test-privacy-settings-save-button]');

      await waitFor('[data-test-privacy-settings-save-button]');

      const notifications = this.owner.lookup('service:notifications');

      assert.strictEqual(notifications.errorMsg, t('pleaseTryAgain'));
    });
  }
);
