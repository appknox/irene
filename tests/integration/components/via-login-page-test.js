import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { Response } from 'miragejs';

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

module('Integration | Component | via-login-page', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    await render(
      hbs`<UserRegistration::ViaLoginPage @enable_name={{false}} @showLoginLink={{true}} />`
    );

    assert.dom('[data-test-registration-form]').exists();

    assert
      .dom('[data-test-registration-form-title]')
      .hasText(t('completeRegistration'));

    assert.dom('[data-test-register-btn]').exists();
  });

  test('it should render email and company name always', async function (assert) {
    await render(
      hbs`<UserRegistration::ViaLoginPage @enable_name={{false}} @showLoginLink={{true}} />`
    );

    assert.dom('[data-test-registration-input-email]').exists();

    assert.dom('[data-test-registration-input-company]').exists();
  });

  test('it should render first name and last name if enable_name is true', async function (assert) {
    this.set('enable_name', false);

    await render(
      hbs`<UserRegistration::ViaLoginPage @enable_name={{false}}></UserRegistration::ViaLoginPage>`
    );

    assert.dom('[data-test-registration-input-fname]').doesNotExist();

    assert.dom('[data-test-registration-input-lname]').doesNotExist();

    this.set('enable_name', true);

    await render(
      hbs`<UserRegistration::ViaLoginPage @enable_name={{true}}></UserRegistration::ViaLoginPage>`
    );

    assert.dom('[data-test-registration-input-fname]').exists();

    assert.dom('[data-test-registration-input-lname]').exists();
  });

  test('it should render login link', async function (assert) {
    await render(
      hbs`<UserRegistration::ViaLoginPage @enable_name={{false}} @showLoginLink={{true}} />`
    );

    assert.dom('[data-test-login-link]').exists();
  });

  test('it should show success message after registration', async function (assert) {
    assert.expect(12);

    this.server.post('/v2/registration', (_, req) => {
      const body = JSON.parse(req.requestBody);

      assert.strictEqual(body.email, 'a@a.com');
      assert.strictEqual(body.company, 'company');
      assert.strictEqual(body.recaptcha, 'notenabled');

      return new Response(201);
    });

    await render(
      hbs`<UserRegistration::ViaLoginPage @enable_name={{false}} @showLoginLink={{true}} />`
    );

    assert.dom('[data-test-register-btn]').exists().isDisabled();

    await fillIn('[data-test-registration-input-email]', 'a@a.com');

    await fillIn('[data-test-registration-input-company]', 'company');

    assert.dom('[data-test-register-btn]').exists().isNotDisabled();

    await click('[data-test-register-btn]');

    assert.dom('[data-test-registration-confirm]').exists();

    assert
      .dom('[data-test-register-confirm-title]')
      .exists()
      .hasText(t('registerConfirmation'));

    assert
      .dom('[data-test-register-confirm-message]')
      .exists()
      .hasText(t('checkEmail'));
  });

  test('it should show error message if registration fails', async function (assert) {
    this.owner.register('service:notifications', NotificationsStub);

    const notify = this.owner.lookup('service:notifications');

    this.server.post('/v2/registration', () => {
      return new Response(
        404,
        {},
        {
          detail: 'Not found',
        }
      );
    });

    await render(
      hbs`<UserRegistration::ViaLoginPage @enable_name={{false}} @showLoginLink={{true}} />`
    );

    assert.dom('[data-test-register-btn]').exists().isDisabled();

    await fillIn('[data-test-registration-input-email]', 'a@a.com');

    await fillIn('[data-test-registration-input-company]', 'company');

    assert.dom('[data-test-register-btn]').exists().isNotDisabled();

    await click('[data-test-register-btn]');

    assert.ok(notify.errorMsg);
  });
});
