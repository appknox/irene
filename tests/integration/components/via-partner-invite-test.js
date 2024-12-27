import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, find, render } from '@ember/test-helpers';
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

module(
  'Integration | Component | user-registration/via-partner-invite',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.server.get('/v2/registration-via-invite', () => {
        return new Response(200);
      });
    });

    test('it renders', async function (assert) {
      await render(hbs`<UserRegistration::ViaPartnerInvite />`);

      assert.dom('[data-test-registration-form]').exists();

      assert
        .dom('[data-test-registration-form-title]')
        .hasText(t('completeRegistration'));

      assert.dom('[data-test-registration-terms-accept]').exists();

      assert.dom('[data-test-register-btn]').exists();
    });

    test('it should render email and company name always', async function (assert) {
      await render(hbs`<UserRegistration::ViaPartnerInvite />`);

      assert.dom('[data-test-registration-input-email]').exists();

      assert.dom('[data-test-registration-input-company]').exists();

      assert.dom('[data-test-registration-input-email]');

      assert.dom('[data-test-registration-input-company]');
    });

    test('it should show validation error for empty username and password too short', async function (assert) {
      await render(hbs`<UserRegistration::ViaPartnerInvite />`);

      assert.dom('[data-test-register-btn]').exists().isDisabled();

      await fillIn('[data-test-registration-input-username]', '');

      await fillIn('[data-test-registration-input-password]', 'test');

      assert
        .dom('[data-test-helper-text="username"]')
        .hasText(
          "Username can't be blank,Username is too short (minimum is 3 characters)"
        );

      assert
        .dom('[data-test-helper-text="password"]')
        .hasText('Password is too short (minimum is 10 characters)');
    });

    test('register button should be enabled for valid entries', async function (assert) {
      await render(hbs`<UserRegistration::ViaPartnerInvite />`);

      assert.dom('[data-test-register-btn]').exists().isDisabled();

      await fillIn('[data-test-registration-input-username]', 'test');

      await fillIn('[data-test-registration-input-password]', 'test@12345');

      await fillIn(
        '[data-test-registration-input-confirm-password]',
        'test@12345'
      );

      await click('[data-test-registration-terms-accept]');

      assert.dom('[data-test-register-btn]').exists().isNotDisabled();
    });

    test('it should send proper registration request', async function (assert) {
      assert.expect(8);

      this.server.post('/v2/registration-via-invite', (_, req) => {
        const data = JSON.parse(req.requestBody);

        assert.strictEqual(data.username, 'test');
        assert.strictEqual(data.password, 'test@12345');
        assert.strictEqual(data.confirm_password, 'test@12345');
        assert.true(data.terms_accepted);

        return new Response(201);
      });

      await render(hbs`<UserRegistration::ViaPartnerInvite />`);

      assert.dom('[data-test-register-btn]').exists().isDisabled();

      await fillIn('[data-test-registration-input-username]', 'test');

      await fillIn('[data-test-registration-input-password]', 'test@12345');

      await fillIn(
        '[data-test-registration-input-confirm-password]',
        'test@12345'
      );

      await click('[data-test-registration-terms-accept]');

      assert.dom('[data-test-register-btn]').exists().isNotDisabled();

      await click('[data-test-register-btn]');
    });

    test('it should show error message if registration fails', async function (assert) {
      this.owner.register('service:notifications', NotificationsStub);

      const notify = this.owner.lookup('service:notifications');

      this.server.post('/v2/registration-via-invite', () => {
        return new Response(500, {}, { error: 'Server Error (500)' });
      });

      await render(hbs`<UserRegistration::ViaPartnerInvite />`);

      await fillIn('[data-test-registration-input-username]', 'test');

      await fillIn('[data-test-registration-input-password]', 'test@12345');

      await fillIn(
        '[data-test-registration-input-confirm-password]',
        'test@12345'
      );

      await click('[data-test-registration-terms-accept]');

      assert.dom('[data-test-register-btn]').exists().isNotDisabled();

      await click('[data-test-register-btn]');

      assert.ok(notify.errorMsg);
    });

    test('it should show invalid page if token is invalid', async function (assert) {
      this.server.get('/v2/registration-via-invite', () => {
        return new Response(400, {}, { token: ['Invalid token'] });
      });

      await render(hbs`<UserRegistration::ViaPartnerInvite />`);

      assert.dom('[data-test-token-error]').exists();

      assert.dom('[data-test-error-SvgIcon]').exists();

      assert.dom('[data-test-error-text]').hasText(t('somethingWentWrong'));

      assert.strictEqual(
        find('[data-test-error-helperText]').innerHTML,
        t('invalidTokenError', { htmlSafe: true }).toString()
      );
    });

    test('it should show error helper text when there is registration error', async function (assert) {
      this.server.post('/v2/registration-via-invite', () => {
        return new Response(
          400,
          {},
          { password: ['This password is too common'] }
        );
      });

      await render(hbs`<UserRegistration::ViaPartnerInvite />`);

      await fillIn('[data-test-registration-input-username]', 'test');

      await fillIn('[data-test-registration-input-password]', 'test@12345');

      await fillIn(
        '[data-test-registration-input-confirm-password]',
        'test@12345'
      );

      await click('[data-test-registration-terms-accept]');

      assert.dom('[data-test-register-btn]').exists().isNotDisabled();

      await click('[data-test-register-btn]');

      assert
        .dom('[data-test-helper-text="password"]')
        .hasText('This password is too common');
    });
  }
);
