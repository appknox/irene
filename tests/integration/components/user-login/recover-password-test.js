import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

import Service from '@ember/service';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';

class LoggerStub extends Service {}

class NotificationStub extends Service {}

module(
  'Integration | Component | user-login/recover-password',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:rollbar', LoggerStub);
      this.owner.register('service:notifications', NotificationStub);
    });

    test('it renders password recover page', async function (assert) {
      await render(hbs`<UserLogin::RecoverPassword />`);

      assert
        .dom('[data-test-user-login-recover-password-username-email-input]')
        .exists();
      assert.dom('[data-test-user-login-recover-password-reset-btn]').exists();

      assert
        .dom('[data-test-user-login-recover-password-header-text]')
        .exists()
        .containsText(t('resetPasswordLabel'));

      assert.dom('[data-test-user-login-recover-password-footer]').exists();
    });

    test('should disable button for empty username/email', async function (assert) {
      await render(hbs`<UserLogin::RecoverPassword />`);

      assert
        .dom('[data-test-user-login-recover-password-username-email-input]')
        .exists()
        .hasNoValue();

      assert
        .dom('[data-test-user-login-recover-password-reset-btn]')
        .isDisabled();
    });

    test('should show message for password recovery mail sent', async function (assert) {
      assert.expect(7);

      const username = 'appknox';

      this.server.post('/v2/forgot_password', (schema, req) => {
        const reqUsername = req.requestBody.split('=')[1];

        assert.strictEqual(username, reqUsername);

        return new Response(200);
      });

      await render(hbs`<UserLogin::RecoverPassword />`);

      assert
        .dom('[data-test-user-login-recover-password-username-email-input]')
        .exists();

      const usernameEmailInput = this.element.querySelector(
        '[data-test-user-login-recover-password-username-email-input]'
      );

      await fillIn(usernameEmailInput, username);

      assert
        .dom('[data-test-user-login-recover-password-username-email-input]')
        .hasValue(username);

      await click('[data-test-user-login-recover-password-reset-btn]');

      assert
        .dom('[data-test-user-login-recover-password-text-to-check]')
        .exists()
        .containsText(t('resetPasswordMessageToCheck'));

      assert
        .dom('[data-test-user-login-recover-password-text-to-retry]')
        .exists()
        .containsText(t('resetPasswordMessageToRetry'));
    });

    test('should hide footer after mail has been sent', async function (assert) {
      assert.expect(5);

      const username = 'appknox';

      this.server.post('/v2/forgot_password', (schema, req) => {
        const reqUsername = req.requestBody.split('=')[1];

        assert.strictEqual(username, reqUsername);

        return new Response(200);
      });

      await render(hbs`<UserLogin::RecoverPassword />`);

      assert.dom('[data-test-user-login-recover-password-footer]').exists();

      assert
        .dom('[data-test-user-login-recover-password-username-email-input]')
        .exists();

      const usernameEmailInput = this.element.querySelector(
        '[data-test-user-login-recover-password-username-email-input]'
      );

      await fillIn(usernameEmailInput, username);

      assert
        .dom('[data-test-user-login-recover-password-username-email-input]')
        .hasValue(username);

      await click('[data-test-user-login-recover-password-reset-btn]');

      assert
        .dom('[data-test-user-login-recover-password-footer]')
        .doesNotExist();
    });
  }
);
