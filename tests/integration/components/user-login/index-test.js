/* eslint-disable qunit/require-expect, qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import { Response } from 'miragejs';

class SessionStub extends Service {
  token = '';
  lastUsername = '';
  lastPassword = '';
  lastOtp = '';
  lastAuthenticator = '';

  get data() {
    return {
      authenticated: {
        b64token: this.token,
      },
    };
  }

  authenticate(authenticator, username, password, otp) {
    this.lastAuthenticator = authenticator;
    this.lastUsername = username;
    this.lastPassword = password;
    this.lastOtp = otp;
    return this.authenticateTestHook();
  }

  authenticateTestHook() {}
}

module('Integration | Component | user-login', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:session', SessionStub);
  });

  test('it renders', async function (assert) {
    await render(hbs`<UserLogin></UserLogin>`);
    assert.dom('[data-test-user-login-check-type]').exists();
  });

  test('it should render check form by default', async function (assert) {
    await render(hbs`<UserLogin></UserLogin>`);

    assert.dom('[data-test-user-login-check-type]').exists();
    assert.dom('[data-test-user-login-check-type-username-input]').exists();
    assert.dom('[data-test-user-login-check-type-button]').exists();
  });

  test('it should render login form from check for not sso', async function (assert) {
    this.server.post('v2/sso/check', function (schema, request) {
      const body = JSON.parse(request.requestBody);
      assert.equal(body.username, 'appknoxusername');

      return new Response(
        200,
        {},
        {
          is_sso: false,
          is_sso_enforced: false,
          token: null,
        }
      );
    });
    await render(hbs`<UserLogin></UserLogin>`);

    assert.dom('[data-test-user-login-check-type]').exists();
    assert.dom('[data-test-user-login-check-type-username-input]').exists();
    assert.dom('[data-test-user-login-check-type-button]').exists();

    const usernameInput = this.element.querySelector(
      '[data-test-user-login-check-type-username-input]'
    );
    const arrowbtn = this.element.querySelector(
      '[data-test-user-login-check-type-button]'
    );

    await fillIn(usernameInput, 'appknoxusername');
    await click(arrowbtn);

    assert.dom('[data-test-user-login-via-username-password]').exists();
    assert
      .dom('[data-test-user-login-via-username-password-username-input]')
      .exists();

    assert
      .dom('[data-test-user-login-via-username-password-password-input]')
      .exists();

    assert
      .dom('[data-test-user-login-via-username-password-login-button]')
      .exists();

    assert
      .dom('[data-test-user-login-via-username-password-username-input]')
      .hasValue('appknoxusername');
  });

  test('it should go back to check form from login from is username is edited', async function (assert) {
    this.server.post('v2/sso/check', function (schema, request) {
      const body = JSON.parse(request.requestBody);
      assert.equal(body.username, 'appknoxusername');

      return new Response(
        200,
        {},
        {
          is_sso: false,
          is_sso_enforced: false,
          token: null,
        }
      );
    });

    await render(hbs`<UserLogin></UserLogin>`);

    assert.dom('[data-test-user-login-check-type]').exists();
    assert.dom('[data-test-user-login-check-type-username-input]').exists();
    assert.dom('[data-test-user-login-check-type-button]').exists();

    const usernameInput = this.element.querySelector(
      '[data-test-user-login-check-type-username-input]'
    );
    const arrowbtn = this.element.querySelector(
      '[data-test-user-login-check-type-button]'
    );

    await fillIn(usernameInput, 'appknoxusername');
    await click(arrowbtn);

    assert.dom('[data-test-user-login-via-username-password]').exists();
    assert
      .dom('[data-test-user-login-via-username-password-username-input]')
      .exists();

    assert
      .dom('[data-test-user-login-via-username-password-password-input]')
      .exists();

    assert
      .dom('[data-test-user-login-via-username-password-login-button]')
      .exists();

    assert
      .dom('[data-test-user-login-via-username-password-username-input]')
      .hasValue('appknoxusername');

    const usernameLoginInput = this.element.querySelector(
      '[data-test-user-login-via-username-password-username-input]'
    );

    await fillIn(usernameLoginInput, 'appknoxuser');

    assert.dom('[data-test-user-login-via-username-password]').doesNotExist();
    assert
      .dom('[data-test-user-login-via-username-password-username-input]')
      .doesNotExist();

    assert
      .dom('[data-test-user-login-via-username-password-password-input]')
      .doesNotExist();

    assert
      .dom('[data-test-user-login-via-username-password-login-button]')
      .doesNotExist();

    assert.dom('[data-test-user-login-check-type]').exists();
    assert.dom('[data-test-user-login-check-type-username-input]').exists();
    assert.dom('[data-test-user-login-check-type-button]').exists();
    assert
      .dom('[data-test-user-login-check-type-username-input]')
      .hasValue('appknoxuser');
  });

  test('it should hit login api with username and password', async function (assert) {
    this.server.post('v2/sso/check', function (schema, request) {
      const body = JSON.parse(request.requestBody);
      assert.equal(body.username, 'appknoxusername');

      return new Response(
        200,
        {},
        {
          is_sso: false,
          is_sso_enforced: false,
          token: null,
        }
      );
    });

    await render(hbs`<UserLogin></UserLogin>`);

    const usernameInput = this.element.querySelector(
      '[data-test-user-login-check-type-username-input]'
    );
    const arrowbtn = this.element.querySelector(
      '[data-test-user-login-check-type-button]'
    );

    await fillIn(usernameInput, 'appknoxusername');
    await click(arrowbtn);

    assert.dom('[data-test-user-login-via-username-password]').exists();
    assert
      .dom('[data-test-user-login-via-username-password-username-input]')
      .exists();

    assert
      .dom('[data-test-user-login-via-username-password-password-input]')
      .exists();

    assert
      .dom('[data-test-user-login-via-username-password-login-button]')
      .exists();

    assert
      .dom('[data-test-user-login-via-username-password-username-input]')
      .hasValue('appknoxusername');

    const passwordLoginInput = this.element.querySelector(
      '[data-test-user-login-via-username-password-password-input]'
    );
    const loginbtn = this.element.querySelector(
      '[data-test-user-login-via-username-password-login-button]'
    );

    await fillIn(passwordLoginInput, 'appknoxpassword');
    await click(loginbtn);

    const session = this.owner.lookup('service:session');

    assert.equal(session.lastUsername, 'appknoxusername');
    assert.equal(session.lastPassword, 'appknoxpassword');
  });

  test('it should show otp screen for email otp flow', async function (assert) {
    this.server.post('v2/sso/check', function (schema, request) {
      const body = JSON.parse(request.requestBody);
      assert.equal(body.username, 'appknoxusername');

      return new Response(
        200,
        {},
        {
          is_sso: false,
          is_sso_enforced: false,
          token: null,
        }
      );
    });

    const session = this.owner.lookup('service:session');
    session.authenticateTestHook = function () {
      const err = new Error('otp required');
      err.payload = {
        message: 'otp required',
        type: 'HOTP',
        forced: false,
      };
      throw err;
    };

    await render(hbs`<UserLogin></UserLogin>`);

    const usernameInput = this.element.querySelector(
      '[data-test-user-login-check-type-username-input]'
    );
    const arrowbtn = this.element.querySelector(
      '[data-test-user-login-check-type-button]'
    );

    await fillIn(usernameInput, 'appknoxusername');
    await click(arrowbtn);

    const passwordLoginInput = this.element.querySelector(
      '[data-test-user-login-via-username-password-password-input]'
    );
    const loginbtn = this.element.querySelector(
      '[data-test-user-login-via-username-password-login-button]'
    );

    await fillIn(passwordLoginInput, 'appknoxpassword');
    await click(loginbtn);

    assert.equal(session.lastUsername, 'appknoxusername');
    assert.equal(session.lastPassword, 'appknoxpassword');

    assert.dom('[data-test-user-login-perform-mfa]').exists();
    assert.dom('[data-test-user-login-perform-mfa-email-otp]').exists();
    assert.dom('[data-test-user-login-perform-mfa-otp-input]').exists();
    assert.dom('[data-test-user-login-perform-mfa-button]').exists();
    assert
      .dom('[data-test-user-login-perform-mfa-email-otp]')
      .hasText(t('emailOTP'));

    const otpInput = this.element.querySelector(
      '[data-test-user-login-perform-mfa-otp-input]'
    );
    const otpbtn = this.element.querySelector(
      '[data-test-user-login-perform-mfa-button]'
    );

    await fillIn(otpInput, '462613');
    await click(otpbtn);

    assert.equal(session.lastUsername, 'appknoxusername');
    assert.equal(session.lastPassword, 'appknoxpassword');
    assert.equal(session.lastOtp, '462613');
  });

  test('it should show otp screen for authenticator otp flow', async function (assert) {
    this.server.post('v2/sso/check', function (schema, request) {
      const body = JSON.parse(request.requestBody);
      assert.equal(body.username, 'appknoxusername');

      return new Response(
        200,
        {},
        {
          is_sso: false,
          is_sso_enforced: false,
          token: null,
        }
      );
    });

    const session = this.owner.lookup('service:session');
    session.authenticateTestHook = function () {
      const err = new Error('otp required');
      err.payload = {
        message: 'otp required',
        type: 'TOTP',
        forced: false,
      };
      throw err;
    };

    await render(hbs`<UserLogin></UserLogin>`);

    const usernameInput = this.element.querySelector(
      '[data-test-user-login-check-type-username-input]'
    );
    const arrowbtn = this.element.querySelector(
      '[data-test-user-login-check-type-button]'
    );

    await fillIn(usernameInput, 'appknoxusername');
    await click(arrowbtn);

    const passwordLoginInput = this.element.querySelector(
      '[data-test-user-login-via-username-password-password-input]'
    );
    const loginbtn = this.element.querySelector(
      '[data-test-user-login-via-username-password-login-button]'
    );

    await fillIn(passwordLoginInput, 'appknoxpassword');
    await click(loginbtn);

    assert.equal(session.lastUsername, 'appknoxusername');
    assert.equal(session.lastPassword, 'appknoxpassword');

    assert.dom('[data-test-user-login-perform-mfa]').exists();
    assert
      .dom('[data-test-user-login-perform-mfa-authenticator-code]')
      .exists();

    assert.dom('[data-test-user-login-perform-mfa-otp-input]').exists();
    assert.dom('[data-test-user-login-perform-mfa-button]').exists();
    assert
      .dom('[data-test-user-login-perform-mfa-authenticator-code]')
      .hasText(t('authenticatorCode'));

    const otpInput = this.element.querySelector(
      '[data-test-user-login-perform-mfa-otp-input]'
    );
    const otpbtn = this.element.querySelector(
      '[data-test-user-login-perform-mfa-button]'
    );

    await fillIn(otpInput, '462613');
    await click(otpbtn);

    assert.equal(session.lastUsername, 'appknoxusername');
    assert.equal(session.lastPassword, 'appknoxpassword');
    assert.equal(session.lastOtp, '462613');
  });

  test('it should show sso button with login form for not forced', async function (assert) {
    this.server.post('v2/sso/check', function (schema, request) {
      const body = JSON.parse(request.requestBody);
      assert.equal(body.username, 'appknoxusername');

      return new Response(
        200,
        {},
        {
          is_sso: true,
          is_sso_enforced: false,
          token: null,
        }
      );
    });

    await render(hbs`<UserLogin></UserLogin>`);

    const usernameInput = this.element.querySelector(
      '[data-test-user-login-check-type-username-input]'
    );
    const arrowbtn = this.element.querySelector(
      '[data-test-user-login-check-type-button]'
    );

    await fillIn(usernameInput, 'appknoxusername');
    await click(arrowbtn);

    assert.dom('[data-test-user-login-via-sso]').doesNotExist();
    assert.dom('[data-test-user-login-via-username-password]').exists();
    assert.dom('[data-test-user-login-via-sso-or]').exists();
    assert.dom('[data-test-user-login-via-sso-not-forced-button]').exists();
    assert.dom('[data-test-user-login-via-sso-or]').hasText(t('or'));
  });

  test('it should show sso button without login form for forced', async function (assert) {
    this.server.post('v2/sso/check', function (schema, request) {
      const body = JSON.parse(request.requestBody);
      assert.equal(body.username, 'appknoxusername');

      return new Response(
        200,
        {},
        {
          is_sso: true,
          is_sso_enforced: true,
          token: null,
        }
      );
    });

    await render(hbs`<UserLogin></UserLogin>`);

    const usernameInput = this.element.querySelector(
      '[data-test-user-login-check-type-username-input]'
    );
    const arrowbtn = this.element.querySelector(
      '[data-test-user-login-check-type-button]'
    );

    await fillIn(usernameInput, 'appknoxusername');
    await click(arrowbtn);

    assert.dom('[data-test-user-login-via-sso]').exists();
    assert.dom('[data-test-user-login-via-username-password]').doesNotExist();
    assert.dom('[data-test-user-login-via-sso-or]').doesNotExist();
    assert
      .dom('[data-test-user-login-via-sso-not-forced-button]')
      .doesNotExist();

    assert.dom('[data-test-user-login-via-sso-forced-username-input]').exists();
    assert.dom('[data-test-user-login-via-sso-forced-button]').exists();
  });

  test('it should hide registration link', async function (assert) {
    this.server.get('v2/frontend_configuration', () => {
      return new Response(
        200,
        {},
        {
          hide_poweredby_logo: true,
          images: {
            favicon: '',
            logo_on_darkbg: '',
            logo_on_lightbg: '',
          },
          integrations: {
            crisp_key: '',
            csb_key: '',
            hotjar_key: '',
            pendo_key: '',
            rollbar_key: '',
          },
          name: '',
          registration_enabled: false,
          registration_link: '',
          theme: {
            primary_alt_color: '',
            primary_color: '',
            scheme: 'dark',
            secondary_alt_color: '',
            secondary_color: '',
          },
          url: '',
        }
      );
    });

    const configuration = this.owner.lookup('service:configuration');

    await configuration.getFrontendConfig();
    await render(hbs`<UserLogin></UserLogin>`);

    assert.dom('[data-test-user-login-registration-link]').doesNotExist();
  });

  test('it should show native registration link', async function (assert) {
    class RouterStub extends Service {
      urlFor(routename) {
        return `/${routename}`;
      }
    }
    this.owner.register('service:router', RouterStub);
    this.server.get('v2/frontend_configuration', () => {
      return new Response(
        200,
        {},
        {
          hide_poweredby_logo: true,
          images: {
            favicon: '',
            logo_on_darkbg: '',
            logo_on_lightbg: '',
          },
          integrations: {
            crisp_key: '',
            csb_key: '',
            hotjar_key: '',
            pendo_key: '',
            rollbar_key: '',
          },
          name: '',
          registration_enabled: true,
          registration_link: '',
          theme: {
            primary_alt_color: '',
            primary_color: '',
            scheme: 'dark',
            secondary_alt_color: '',
            secondary_color: '',
          },
          url: '',
        }
      );
    });

    const configuration = this.owner.lookup('service:configuration');

    await configuration.getFrontendConfig();
    await render(hbs`<UserLogin></UserLogin>`);

    assert.dom('[data-test-user-login-registration-link]').exists();
    assert
      .dom('[data-test-user-login-registration-link]')
      .hasAttribute('href', '/register');
  });

  test('it should show external registration link', async function (assert) {
    this.server.get('v2/frontend_configuration', () => {
      return new Response(
        200,
        {},
        {
          hide_poweredby_logo: true,
          images: {
            favicon: '',
            logo_on_darkbg: '',
            logo_on_lightbg: '',
          },
          integrations: {
            crisp_key: '',
            csb_key: '',
            hotjar_key: '',
            pendo_key: '',
            rollbar_key: '',
          },
          name: '',
          registration_enabled: false,
          registration_link: 'https://example.com/registration',
          theme: {
            primary_alt_color: '',
            primary_color: '',
            scheme: 'dark',
            secondary_alt_color: '',
            secondary_color: '',
          },
          url: '',
        }
      );
    });

    const configuration = this.owner.lookup('service:configuration');

    await configuration.getFrontendConfig();
    await render(hbs`<UserLogin></UserLogin>`);

    assert.dom('[data-test-user-login-registration-link]').exists();
    assert
      .dom('[data-test-user-login-registration-link]')
      .hasAttribute('href', 'https://example.com/registration');
  });

  test('it should show external registration link for reg enabled', async function (assert) {
    this.server.get('v2/frontend_configuration', () => {
      return new Response(
        200,
        {},
        {
          hide_poweredby_logo: true,
          images: {
            favicon: '',
            logo_on_darkbg: '',
            logo_on_lightbg: '',
          },
          integrations: {
            crisp_key: '',
            csb_key: '',
            hotjar_key: '',
            pendo_key: '',
            rollbar_key: '',
          },
          name: '',
          registration_enabled: true,
          registration_link: 'https://example.com/registration',
          theme: {
            primary_alt_color: '',
            primary_color: '',
            scheme: 'dark',
            secondary_alt_color: '',
            secondary_color: '',
          },
          url: '',
        }
      );
    });

    const configuration = this.owner.lookup('service:configuration');

    await configuration.getFrontendConfig();
    await render(hbs`<UserLogin></UserLogin>`);

    assert.dom('[data-test-user-login-registration-link]').exists();
    assert
      .dom('[data-test-user-login-registration-link]')
      .hasAttribute('href', 'https://example.com/registration');
  });
});
