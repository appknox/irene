import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
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

class OrganizationMeStub extends Service {
  org = {
    is_owner: true,
    is_admin: true,
  };
}

module(
  'Integration | Component | account-settings/security/multi-factor-auth',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:me', OrganizationMeStub);

      const store = this.owner.lookup('service:store');

      this.stubMfaState = (overrides = {}) => {
        this.server.get('/v2/mfa', () => {
          return {
            count: 2,
            next: null,
            previous: null,
            results: [
              {
                method: 1,
                enabled: overrides[1] ?? false,
              },
              {
                method: 2,
                enabled: overrides[2] ?? false,
              },
            ],
          };
        });
      };

      this.server.post('/v2/mfa', () => {
        return new Response(200);
      });

      this.stubMfaState();

      this.setProperties({
        user: store.createRecord(
          'user',
          this.server.create('user', { canDisableMfa: true }).toJSON()
        ),
      });
    });

    test('it should render', async function (assert) {
      await render(
        hbs`<AccountSettings::Security::MultiFactorAuth @user={{this.user}} />`
      );

      assert.dom('[data-test-mfa-title]').hasText(t('multiFactorAuth'));

      assert.dom('[data-test-mfa-description]').hasText(t('mfaDescription'));

      assert.dom('[data-test-mfa-options]').exists();

      assert.dom(`[data-test-enable-button='1']`).exists();

      assert.dom(`[data-test-disable-button='1']`).doesNotExist();

      assert.dom(`[data-test-enable-button='2']`).exists();

      assert.dom(`[data-test-disable-button='2']`).doesNotExist();
    });

    test('it should render when user can not disable mfa', async function (assert) {
      const user = this.server
        .create('user', { canDisableMfa: false })
        .toJSON();

      this.set('newUser', user);

      this.stubMfaState({ 1: true });

      await render(
        hbs`<AccountSettings::Security::MultiFactorAuth @user={{this.newUser}} />`
      );

      assert.dom('[data-test-mfa-title]').hasText(t('multiFactorAuth'));

      assert.dom('[data-test-mfa-description]').hasText(t('mfaDescription'));

      assert.dom('[data-test-mfa-options]').exists();

      assert.dom(`[data-test-enable-button='1']`).doesNotExist();

      assert.dom(`[data-test-disable-button='1']`).doesNotExist();

      assert
        .dom(`[data-test-mfa-cannot-disable-text]`)
        .exists()
        .hasText(t('disableMFADenied'));
    });

    test('it enables email', async function (assert) {
      await render(
        hbs`<AccountSettings::Security::MultiFactorAuth @user={{this.user}} />`
      );

      assert.dom(`[data-test-enable-button='2']`).exists();

      await click(`[data-test-enable-button='2']`);

      assert.dom('[data-test-mfa-email-enable-title]').exists();

      assert
        .dom('[data-test-mfa-email-enable-title-send-confirm]')
        .exists()
        .hasText(
          `${t('modalCard.enableMFAEmail.sendMailMsg')} ${this.user.email}`
        );

      this.stubMfaState({ 2: true });

      assert.dom('[data-test-mfa-email-enable-continue-button]').exists();

      await click('[data-test-mfa-email-enable-continue-button]');

      assert
        .dom('[data-test-mfa-email-enable-title-send-confirm]')
        .doesNotExist();

      assert
        .dom('[data-test-mfa-email-enable-email-desc]')
        .exists()
        .hasText(
          `${t('modalCard.enableMFAEmail.description')} ${this.user.email}`
        );

      assert.dom('[data-test-mfa-email-enable-email-textfield]').exists();

      await fillIn('[data-test-mfa-email-enable-email-textfield]', '000000');

      assert.dom('[data-test-mfa-email-enable-confirm-button]').exists();

      await click('[data-test-mfa-email-enable-confirm-button]');

      assert.dom(`[data-test-enable-button='2']`).doesNotExist();

      assert.dom(`[data-test-disable-button='2']`).exists();
    });

    test('it disables email mfa', async function (assert) {
      this.server.delete('/v2/mfa', () => {
        return new Response(200);
      });

      this.stubMfaState({ 2: true });

      await render(
        hbs`<AccountSettings::Security::MultiFactorAuth @user={{this.user}} />`
      );

      assert.dom(`[data-test-enable-button='2']`).doesNotExist();

      assert.dom(`[data-test-disable-button='2']`).exists();

      await click(`[data-test-disable-button='2']`);

      assert
        .dom(`[data-test-mfa-disable-email-title]`)
        .exists()
        .hasText(t('modalCard.enableMFAEmail.sendMailMsg'));

      assert.dom(`[data-test-mfa-disable-continue]`).exists();

      await click(`[data-test-mfa-disable-continue]`);

      assert
        .dom(`[data-test-mfa-disable-denied]`)
        .exists()
        .hasText(t('disableMFADenied'));

      assert
        .dom(`[data-test-mfa-disable-desc]`)
        .exists()
        .hasText(
          `${t('modalCard.disableMFA.enterOTP')} ${t('modalCard.disableMFA.viaEmail')}`
        );

      assert.dom(`[data-test-mfa-disable-textfield]`).exists();

      await fillIn('[data-test-mfa-disable-textfield]', '000000');

      this.stubMfaState();

      assert.dom(`[data-test-mfa-disable-confirm]`).exists();

      await click(`[data-test-mfa-disable-confirm]`);

      assert.dom(`[data-test-enable-button='2']`).exists();

      assert.dom(`[data-test-disable-button='2']`).doesNotExist();
    });

    test('it enables mfa', async function (assert) {
      await render(
        hbs`<AccountSettings::Security::MultiFactorAuth @user={{this.user}} />`
      );

      assert.dom(`[data-test-enable-button='1']`).exists();

      await click(`[data-test-enable-button='1']`);

      assert
        .dom('[data-test-mfa-appverify-title]')
        .exists()
        .hasText(t('modalCard.enableMFAApp.scanBarcode'));

      assert.dom('[data-test-mfa-appverify-qrcode]').exists();

      assert.dom('[data-test-mfa-appverify-textfield]').exists();

      await fillIn('[data-test-mfa-appverify-textfield]', '000000');

      this.stubMfaState({ 1: true });

      assert.dom('[data-test-mfa-appverify-continue-button]').exists();

      await click('[data-test-mfa-appverify-continue-button]');

      assert.dom(`[data-test-enable-button='1']`).doesNotExist();

      assert.dom(`[data-test-disable-button='1']`).exists();
    });

    test('it disables app mfa', async function (assert) {
      this.server.delete('/v2/mfa', () => {
        return new Response(200);
      });

      this.stubMfaState({ 1: true });

      await render(
        hbs`<AccountSettings::Security::MultiFactorAuth @user={{this.user}} />`
      );

      assert.dom(`[data-test-enable-button='1']`).doesNotExist();

      assert.dom(`[data-test-disable-button='1']`).exists();

      await click(`[data-test-disable-button='1']`);

      assert
        .dom(`[data-test-mfa-disable-email-title]`)
        .exists()
        .hasText(t('modalCard.enableMFAEmail.sendMailMsg'));

      assert.dom(`[data-test-mfa-disable-continue]`).exists();

      await click(`[data-test-mfa-disable-continue]`);

      assert
        .dom(`[data-test-mfa-disable-denied]`)
        .exists()
        .hasText(t('disableMFADenied'));

      assert
        .dom(`[data-test-mfa-disable-desc]`)
        .exists()
        .hasText(
          `${t('modalCard.disableMFA.enterOTP')} ${t('modalCard.disableMFA.viaApp')}`
        );

      assert.dom(`[data-test-mfa-disable-textfield]`).exists();

      await fillIn('[data-test-mfa-disable-textfield]', '000000');

      this.stubMfaState();

      assert.dom(`[data-test-mfa-disable-confirm]`).exists();

      await click(`[data-test-mfa-disable-confirm]`);

      assert.dom(`[data-test-enable-button='1']`).exists();

      assert.dom(`[data-test-disable-button='1']`).doesNotExist();
    });

    test('it switches to email from app mfa', async function (assert) {
      this.stubMfaState({ 1: true });

      await render(
        hbs`<AccountSettings::Security::MultiFactorAuth @user={{this.user}} />`
      );

      assert.dom(`[data-test-enable-button='1']`).doesNotExist();

      assert.dom(`[data-test-disable-button='1']`).exists();

      assert.dom(`[data-test-enable-button='2']`).exists();

      assert.dom(`[data-test-disable-button='2']`).doesNotExist();

      await click(`[data-test-enable-button='2']`);

      assert.strictEqual(
        find('[data-test-switch-to-email-desc]').innerHTML.trim(),
        t('mfaSwitchToEmailDescription', {
          htmlSafe: true,
        })
          .toString()
          .trim()
      );

      assert.dom(`[data-test-switch-to-email-confirm]`).exists();

      await click(`[data-test-switch-to-email-confirm]`);

      assert
        .dom(`[data-test-switch-to-email-app-verify]`)
        .exists()
        .hasText(
          `${t('modalCard.disableMFA.enterOTP')} ${t('modalCard.disableMFA.viaApp')}`
        );

      assert.dom(`[data-test-switch-to-email-app-verify-textfield]`).exists();

      await fillIn(
        '[data-test-switch-to-email-app-verify-textfield]',
        '000000'
      );

      assert.dom(`[data-test-switch-to-email-app-verify-confirm]`).exists();

      await click(`[data-test-switch-to-email-app-verify-confirm]`);

      assert.dom(`[data-test-switch-to-email-enable-email]`).exists();

      this.stubMfaState({ 2: true });

      assert.dom(`[data-test-switch-to-email-enable-email-textfield]`).exists();

      await fillIn(
        '[data-test-switch-to-email-enable-email-textfield]',
        '000000'
      );

      assert.dom(`[data-test-switch-to-email-enable-email-confirm]`).exists();

      await click(`[data-test-switch-to-email-enable-email-confirm]`);

      assert.dom(`[data-test-enable-button='1']`).exists();

      assert.dom(`[data-test-disable-button='1']`).doesNotExist();

      assert.dom(`[data-test-enable-button='2']`).doesNotExist();

      assert.dom(`[data-test-disable-button='2']`).exists();
    });

    test('it switches to app from email mfa', async function (assert) {
      this.stubMfaState({ 2: true });

      await render(
        hbs`<AccountSettings::Security::MultiFactorAuth @user={{this.user}} />`
      );

      assert.dom(`[data-test-enable-button='1']`).exists();

      assert.dom(`[data-test-disable-button='1']`).doesNotExist();

      assert.dom(`[data-test-enable-button='2']`).doesNotExist();

      assert.dom(`[data-test-disable-button='2']`).exists();

      await click(`[data-test-enable-button='1']`);

      assert.strictEqual(
        find('[data-test-switch-to-app-desc]').innerHTML.trim(),
        t('mfaSwitchToAppDescription', {
          htmlSafe: true,
        })
          .toString()
          .trim()
      );

      this.server.post('/v2/mfa', () => {
        return new Response(
          400,
          { 'Content-Type': 'application/json' },
          { otp: ['OTP is required'] }
        );
      });

      assert.dom(`[data-test-switch-to-app-continue]`).exists();

      await click(`[data-test-switch-to-app-continue]`);

      this.server.post('/v2/mfa', () => {
        return new Response(200);
      });

      assert
        .dom(`[data-test-switch-to-app-disable-email]`)
        .exists()
        .hasText(
          `${t('modalCard.enableMFAEmail.description')} ${this.user.email}`
        );

      assert.dom(`[data-test-switch-to-app-disable-email-field]`).exists();

      await fillIn('[data-test-switch-to-app-disable-email-field]', '000000');

      assert.dom(`[data-test-switch-to-app-disable-email-confirm]`).exists();

      await click(`[data-test-switch-to-app-disable-email-confirm]`);

      assert
        .dom('[data-test-mfa-appverify-title]')
        .exists()
        .hasText(t('modalCard.enableMFAApp.scanBarcode'));

      assert.dom('[data-test-mfa-appverify-qrcode]').exists();

      assert.dom('[data-test-mfa-appverify-textfield]').exists();

      await fillIn('[data-test-mfa-appverify-textfield]', '000000');

      this.stubMfaState({ 1: true });

      assert.dom('[data-test-mfa-appverify-continue-button]').exists();

      await click('[data-test-mfa-appverify-continue-button]');

      assert.dom(`[data-test-enable-button='1']`).doesNotExist();

      assert.dom(`[data-test-disable-button='1']`).exists();

      assert.dom(`[data-test-enable-button='2']`).exists();

      assert.dom(`[data-test-disable-button='2']`).doesNotExist();
    });
  }
);
