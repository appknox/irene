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

module(
  'Integration | Component | user-registration/via-org-invite',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.setProperties({
        email: 'test@test.com',
        company: 'Appknox',
        isSSOEnforced: false,
      });
    });

    test('it renders', async function (assert) {
      await render(
        hbs`<UserRegistration::ViaOrgInvite @email={{this.email}} @company={{this.company}} @isSSOEnforced={{this.isSSOEnforced}}></UserRegistration::ViaOrgInvite>`
      );

      assert.dom('[data-test-registration-form]').exists();

      assert
        .dom('[data-test-registration-form-title]')
        .hasText(t('completeRegistration'));

      assert.dom('[data-test-registration-terms-accept]').exists();

      assert.dom('[data-test-register-btn]').exists();
    });

    test('it should render email and company name always', async function (assert) {
      this.isSSOEnforced = true;

      await render(
        hbs`<UserRegistration::ViaOrgInvite @email={{this.email}} @company={{this.company}} @isSSOEnforced={{this.isSSOEnforced}}></UserRegistration::ViaOrgInvite>`
      );

      assert.dom('[data-test-registration-input-email]').exists();

      assert.dom('[data-test-registration-input-company]').exists();

      assert.dom('[data-test-registration-input-email]').hasValue(this.email);

      assert
        .dom('[data-test-registration-input-company]')
        .hasValue(this.company);
    });

    test('it should not render first name and last name when sso is enabled', async function (assert) {
      this.isSSOEnforced = true;

      await render(
        hbs`<UserRegistration::ViaOrgInvite @email={{this.email}} @company={{this.company}} @isSSOEnforced={{this.isSSOEnforced}}></UserRegistration::ViaOrgInvite>`
      );

      assert.dom('[data-test-registration-input-email]').exists();

      assert.dom('[data-test-registration-input-company]').exists();

      assert.dom('[data-test-registration-input-fname]').doesNotExist();

      assert.dom('[data-test-registration-input-lname]').doesNotExist();

      assert.dom('[data-test-registration-terms-accept]').exists();
    });

    test('it should render first name and last name if sso is not enabled', async function (assert) {
      await render(
        hbs`<UserRegistration::ViaOrgInvite @email={{this.email}} @company={{this.company}} @isSSOEnforced={{this.isSSOEnforced}}></UserRegistration::ViaOrgInvite>`
      );

      assert.dom('[data-test-registration-input-company]').exists();

      assert.dom('[data-test-registration-input-fname]').exists();

      assert.dom('[data-test-registration-input-lname]').exists();

      assert.dom('[data-test-registration-input-username]').exists();

      assert.dom('[data-test-registration-input-password]').exists();

      assert.dom('[data-test-registration-input-confirm-password]').exists();

      assert.dom('[data-test-registration-terms-accept]').exists();
    });

    test('it should show validation error for password not matching', async function (assert) {
      this.isSSOEnforced = false;

      await render(
        hbs`<UserRegistration::ViaOrgInvite @isSSOEnforced={{this.isSSOEnforced}} @email={{this.email}}></UserRegistration::ViaOrgInvite>`
      );

      assert.dom('[data-test-register-btn]').exists().isDisabled();

      await fillIn('[data-test-registration-input-username]', 'test');

      await fillIn('[data-test-registration-input-password]', 'test');

      await fillIn('[data-test-registration-input-confirm-password]', 'test1');

      assert
        .dom('[data-test-helper-text="confirm-password"]')
        .hasText("Password confirmation doesn't match password");
    });

    test('it should not show validation error for non-empty company and email', async function (assert) {
      await render(
        hbs`<UserRegistration::ViaOrgInvite @isSSOEnforced={{this.isSSOEnforced}} @email={{this.email}} @company={{this.company}}></UserRegistration::ViaOrgInvite>`
      );

      assert.dom('[data-test-register-btn]').exists().isDisabled();

      assert.dom('[data-test-helper-text="company"]').doesNotExist();

      assert.dom('[data-test-helper-text="email"]').doesNotExist();
    });

    test('it should show validation error for terms not accepted', async function (assert) {
      await render(
        hbs`<UserRegistration::ViaOrgInvite @isSSOEnforced={{this.isSSOEnforced}} @email={{this.email}} @company={{this.company}}></UserRegistration::ViaOrgInvite>`
      );

      const register_btn = this.element.querySelector(
        '[data-test-register-btn]'
      );

      await click('[data-test-registration-terms-accept]');

      assert.dom('[data-test-registration-terms-accept]').isChecked();

      await click('[data-test-registration-terms-accept]');

      assert.dom('[data-test-registration-terms-accept]').isNotChecked();

      assert.dom(register_btn).exists().isDisabled();

      assert
        .dom('[data-test-helper-text="terms-accepted"]')
        .exists()
        .hasText('Please accept terms & conditions to proceed');
    });

    test('it should show success message after registration', async function (assert) {
      assert.expect(13);

      this.server.post('/invite', (_, req) => {
        const data = JSON.parse(req.requestBody);

        const { username, terms_accepted, password, confirm_password } = data;

        assert.strictEqual(username, 'test');
        assert.true(terms_accepted);
        assert.strictEqual(password, 'test@12345');
        assert.strictEqual(confirm_password, 'test@12345');

        return new Response(201);
      });

      await render(
        hbs`<UserRegistration::ViaOrgInvite @isSSOEnforced={{this.isSSOEnforced}} @email={{this.email}} @company={{this.company}}></UserRegistration::ViaOrgInvite>`
      );

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

      assert.dom('[data-test-registration-confirm]').exists();

      assert
        .dom('[data-test-register-confirm-title]')
        .exists()
        .hasText(t('invitationRegisterConfirmation'));

      assert
        .dom('[data-test-register-confirm-message]')
        .exists()
        .hasText(t('pleaseLogin'));
    });

    test('it should show error message if registration fails', async function (assert) {
      this.owner.register('service:notifications', NotificationsStub);

      const notify = this.owner.lookup('service:notifications');

      this.server.post('/invite', () => {
        return new Response(
          404,
          {},
          {
            detail: 'Not found',
          }
        );
      });

      await render(
        hbs`<UserRegistration::ViaOrgInvite @isSSOEnforced={{this.isSSOEnforced}} @email={{this.email}} @company={{this.company}}></UserRegistration::ViaOrgInvite>`
      );

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

    test('it should show error message in helper text if registration fails', async function (assert) {
      this.server.post('/invite', () => {
        return new Response(
          400,
          {},
          {
            username: 'Username already exists',
          }
        );
      });

      await render(
        hbs`<UserRegistration::ViaOrgInvite @isSSOEnforced={{this.isSSOEnforced}} @email={{this.email}} @company={{this.company}}></UserRegistration::ViaOrgInvite>`
      );

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
        .dom('[data-test-helper-text="username"]')
        .hasText('Username already exists');
    });
  }
);
