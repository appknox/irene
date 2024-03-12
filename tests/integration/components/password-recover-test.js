import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

import Service from '@ember/service';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';

class LoggerStub extends Service {}

class NotificationStub extends Service {}

module('Integration | Component | password-recover', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:rollbar', LoggerStub);
    this.owner.register('service:notifications', NotificationStub);
  });

  test('it renders password recover page', async function (assert) {
    await render(hbs`<PasswordRecover />`);

    assert.dom('[data-test-username-email-input]').exists();
    assert.dom('[data-test-send-reset-mail-btn]').exists();

    assert
      .dom('[data-test-reset-password-header-text]')
      .exists()
      .containsText('t:resetPassword:()');

    assert
      .dom('[data-test-reset-password-login-link]')
      .exists()
      .containsText('t:login:()')
      .hasAttribute('href', /login$/);
  });

  test('should show error for empty username/email', async function (assert) {
    await render(hbs`<PasswordRecover />`);

    assert.dom('[data-test-username-email-input]').exists().hasNoValue();
    assert.dom('[data-test-username-error]').doesNotExist();

    await click('[data-test-send-reset-mail-btn]');

    assert.dom('[data-test-username-error]').exists();
  });

  test('should show message for password recovery mail sent', async function (assert) {
    assert.expect(6);

    const username = 'appknox';

    this.server.post('/v2/forgot_password', (schema, req) => {
      const reqUsername = req.requestBody.split('=')[1];

      assert.strictEqual(username, reqUsername);

      return new Response(200);
    });

    await render(hbs`<PasswordRecover />`);

    assert.dom('[data-test-username-email-input]').exists();

    const usernameEmailInput = this.element.querySelector(
      '[data-test-username-email-input]'
    );

    await fillIn(usernameEmailInput, username);

    assert.dom('[data-test-username-email-input]').hasValue(username);

    await click('[data-test-send-reset-mail-btn]');

    assert
      .dom('[data-test-mail-sent-text]')
      .exists()
      .containsText(
        "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."
      )
      .containsText(
        'If you are not receiving new emails after a few attempts, please retry after 24 hours or contact support.'
      );
  });
});
