import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

import Service from '@ember/service';

class AjaxStub extends Service {
  post() {
    return new Promise(function (resolve) {
      resolve();
    });
  }
}

class LoggerStub extends Service {}

class NotificationStub extends Service {}

module('Integration | Component | password-recover', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:ajax', AjaxStub);
    this.owner.register('service:rollbar', LoggerStub);
    this.owner.register('service:notifications', NotificationStub);
  });

  test('it renders password recover page', async function (assert) {
    await render(hbs`<PasswordRecover />`);

    assert.dom('[data-test-username-email-input]').exists();
    assert.dom('[data-test-send-reset-mail-btn]').exists();
  });

  test('should show error for empty username/email', async function (assert) {
    await render(hbs`<PasswordRecover />`);

    assert.dom('[data-test-username-email-input]').exists().hasNoValue();
    assert.dom('[data-test-username-error]').doesNotExist();

    await click('[data-test-send-reset-mail-btn]');

    assert.dom('[data-test-username-error]').exists();
  });

  test('should show message for password recovery mail sent', async function (assert) {
    await render(hbs`<PasswordRecover />`);

    assert.dom('[data-test-username-email-input]').exists();

    const usernameEmailInput = this.element.querySelector(
      '[data-test-username-email-input]'
    );

    await fillIn(usernameEmailInput, 'appknox');

    assert.dom('[data-test-username-email-input]').hasValue('appknox');

    await click('[data-test-send-reset-mail-btn]');

    assert.dom('[data-test-mail-sent-text]').exists().hasAnyText();
  });
});
