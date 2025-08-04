import { module, test } from 'qunit';

import {
  click,
  currentURL,
  fillIn,
  visit,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';

import { setupApplicationTest } from 'ember-qunit';
import { createAuthSession } from 'irene/tests/helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { faker } from '@faker-js/faker';
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

const createOidcTokenValidateResponse = (overrides = {}) => ({
  valid: true,
  redirect_url: null,
  error: null,
  ...overrides,
});

const createOidcAuthorizeFormResponse = (overrides = {}) => ({
  form_data: {
    application_name: faker.company.name(),
    scopes_descriptions: [faker.lorem.sentence(5), faker.lorem.sentence(5)],
    authorization_needed: false,
  },
  validation_result: {
    valid: true,
    redirect_url: null,
    error: null,
  },
  ...overrides,
});

const createOidcAuthorizeResponse = (overrides = {}) => ({
  valid: true,
  redirect_url: faker.internet.url({ appendSlash: true }),
  error: null,
  ...overrides,
});

const SSO_TOKEN = faker.string.alphanumeric({ length: 100 });

module('Acceptance | oidc login', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupBrowserFakes(hooks, { window: true, sessionStorage: true });

  hooks.beforeEach(async function () {
    const token = (length) => faker.string.alphanumeric({ length });

    const router = this.owner.lookup('service:router');

    this.routeHandler = (transition) => {
      // abort route after login since window is stubbed
      if (transition.to.name === 'authenticated.index') {
        transition?.abort();
      }
    };

    router.on('routeWillChange', this.routeHandler);

    this.setProperties({
      router,
      oidcToken: encodeURIComponent(`${token(84)}:${token(6)}:${token(43)}`),
    });
  });

  hooks.afterEach(async function () {
    this.router.off('routeWillChange', this.routeHandler);
  });

  const handleUserAuthorizeFlow = async (
    assert,
    authorizationResponse,
    authorize
  ) => {
    assert.dom('[data-test-img-logo]').exists();

    assert.dom('[data-test-oidcAuthorize-heading]').hasText(
      t('oidcModule.permissionHeading', {
        applicationName: authorizationResponse.form_data.application_name,
      })
    );

    authorizationResponse.form_data.scopes_descriptions.forEach((sd) => {
      assert
        .dom(`[data-test-oidcAuthorize-scopeDescription="${sd}"]`)
        .hasText(sd);
    });

    assert
      .dom('[data-test-oidcAuthorize-cancelBtn]')
      .isNotDisabled()
      .hasText(t('cancel'));

    assert
      .dom('[data-test-oidcAuthorize-authorizeBtn]')
      .isNotDisabled()
      .hasText(t('authorize'));

    if (authorize) {
      await click('[data-test-oidcAuthorize-authorizeBtn]');
    } else {
      await click('[data-test-oidcAuthorize-cancelBtn]');
    }
  };

  const handleUserLoginFlow = async (
    assert,
    server,
    is_saml = false,
    is_oidc = false
  ) => {
    server.post(
      'v2/sso/check',
      () =>
        new Response(
          200,
          {},
          {
            is_saml: Boolean(is_saml),
            is_sso_enforced: Boolean(is_saml),
            token: SSO_TOKEN,
            is_oidc: Boolean(is_oidc),
          }
        )
    );

    server.get('/sso/saml2', () => ({
      url: `https://accounts.example.com/o/saml2/idp?idpid=${faker.string.alphanumeric(
        100
      )}`,
    }));

    server.post(
      '/sso/saml2/login',
      () =>
        new Response(
          200,
          {},
          {
            user_id: '1',
            token: SSO_TOKEN,
          }
        )
    );

    // Mock OIDC SSO endpoint
    server.post('/sso/oidc/authenticate', (_, req) => {
      const data = JSON.parse(req.requestBody);

      return new Response(
        200,
        {},
        {
          url: `https://accounts.google.com/o/oauth2/auth?client_id=${faker.string.alphanumeric(20)}&redirect_uri=${encodeURIComponent(data.redirect_uri)}&response_type=code&scope=openid%20email%20profile`,
          username: data.username,
        }
      );
    });

    server.post(
      '/login',
      () =>
        new Response(
          200,
          {},
          {
            user_id: '1',
            token: faker.string.alphanumeric({ length: 50 }),
          }
        )
    );

    await fillIn(
      '[data-test-user-login-check-type-username-input]',
      'appknoxusername'
    );

    await click('[data-test-user-login-check-type-button]');

    const sso = is_saml || is_oidc;

    if (sso) {
      assert
        .dom('[data-test-user-login-via-sso-forced-username-input]')
        .hasValue('appknoxusername');

      assert
        .dom('[data-test-user-login-via-sso-forced-button]')
        .isNotDisabled();

      await click('[data-test-user-login-via-sso-forced-button]');

      // simulate server redirect
      await visit(`/saml2/redirect?sso_token=${SSO_TOKEN}`);
    } else {
      assert
        .dom('[data-test-user-login-via-username-password-username-input]')
        .hasValue('appknoxusername');

      assert
        .dom('[data-test-user-login-via-username-password-password-input]')
        .exists();

      await fillIn(
        '[data-test-user-login-via-username-password-password-input]',
        'appknoxpassword'
      );

      assert
        .dom('[data-test-user-login-via-username-password-login-button]')
        .isNotDisabled();

      await click('[data-test-user-login-via-username-password-login-button]');
    }
  };

  test.each(
    'oidc login flow for athenticated/unathenticated user',
    [
      { authorizationNeeded: false, authenticated: true, assertions: 6 },
      { authorizationNeeded: true, authenticated: true, assertions: 14 },
      {
        authorizationNeeded: false,
        loginByUsernamePassword: true,
        assertions: 10,
      },
      {
        authorizationNeeded: true,
        loginByUsernamePassword: true,
        assertions: 18,
      },
      { authorizationNeeded: false, loginBySSO: true, assertions: 9 },
      { authorizationNeeded: true, loginBySSO: true, assertions: 17 },
    ],
    async function (
      assert,
      {
        authorizationNeeded,
        authenticated,
        loginByUsernamePassword,
        loginBySSO,
        assertions,
      }
    ) {
      assert.expect(assertions);

      const window = this.owner.lookup('service:browser/window');

      const tokenValidateResponse = createOidcTokenValidateResponse();

      const oidcAuthorizationResponse = createOidcAuthorizeFormResponse();

      oidcAuthorizationResponse.form_data.authorization_needed =
        authorizationNeeded;

      const oidcAuthorizeResponse = createOidcAuthorizeResponse();

      const decodedOidcToken = decodeURIComponent(this.oidcToken);

      this.server.post('/v2/oidc/authorization/validate', (_, req) => {
        const data = JSON.parse(req.requestBody);

        assert.strictEqual(data.oidc_token, decodedOidcToken);

        return new Response(200, {}, tokenValidateResponse);
      });

      this.server.post('/v2/oidc/authorization', (_, req) => {
        const data = JSON.parse(req.requestBody);

        assert.strictEqual(data.oidc_token, decodedOidcToken);

        return new Response(200, {}, oidcAuthorizationResponse);
      });

      this.server.post('/v2/oidc/authorization/authorize', (_, req) => {
        const data = JSON.parse(req.requestBody);

        assert.strictEqual(data.oidc_token, decodedOidcToken);

        if (authorizationNeeded) {
          assert.true(data.allow);
        } else {
          assert.notOk(data.allow);
        }

        return new Response(200, {}, oidcAuthorizeResponse);
      });

      // create auth session for pre authentication
      if (authenticated) {
        await createAuthSession();
      }

      try {
        await visit(`/dashboard/oidc/redirect?oidc_token=${this.oidcToken}`);
      } catch (error) {
        if (error.message !== 'TransitionAborted') {
          throw error;
        }
      }

      if (!authenticated) {
        assert.strictEqual(currentURL(), '/login', 'Redirected to /login');

        if (loginByUsernamePassword) {
          await handleUserLoginFlow(assert, this.server);
        }

        if (loginBySSO) {
          await handleUserLoginFlow(assert, this.server, true, 'google-test');
        }

        // Simulating redirect from authenticator since window is stubbed
        await visit(window.location.pathname + window.location.search);
      }

      await waitUntil(() => currentURL().includes('/dashboard/oidc/authorize'));

      assert.strictEqual(
        currentURL(),
        `/dashboard/oidc/authorize?oidc_token=${this.oidcToken}`,
        `Redirected to /dashboard/oidc/authorize?oidc_token=${this.oidcToken}`
      );

      if (authorizationNeeded) {
        await handleUserAuthorizeFlow(assert, oidcAuthorizationResponse, true);
      }

      await waitUntil(
        () => oidcAuthorizeResponse.redirect_url === window.location.href,
        { timeout: 1000 }
      );

      assert.strictEqual(
        oidcAuthorizeResponse.redirect_url,
        window.location.href,
        `Redirected to ${window.location.href}`
      );
    }
  );

  test('oidc sso login flow', async function (assert) {
    assert.expect(3);

    this.server.post(
      'v2/sso/check',
      () =>
        new Response(
          200,
          {},
          {
            is_saml: false,
            is_sso_enforced: true,
            token: SSO_TOKEN,
            is_oidc: true,
          }
        )
    );

    this.server.post('/sso/oidc/authenticate', (_, req) => {
      const data = JSON.parse(req.requestBody);

      assert.strictEqual(
        data.redirect_uri,
        `${window.location.origin}/sso/oidc/redirect`
      );

      return new Response(
        200,
        {},
        {
          url: `https://accounts.google.com/o/oauth2/auth?client_id=test&redirect_uri=${encodeURIComponent(data.redirect_uri)}&response_type=code&scope=openid%20email%20profile`,
          username: 'google-test',
        }
      );
    });

    await visit('/login');

    await fillIn(
      '[data-test-user-login-check-type-username-input]',
      'testuser@example.com'
    );

    await click('[data-test-user-login-check-type-button]');

    assert
      .dom('[data-test-user-login-via-sso-forced-username-input]')
      .hasValue('testuser@example.com');

    assert.dom('[data-test-user-login-via-sso-forced-button]').isNotDisabled();

    await click('[data-test-user-login-via-sso-forced-button]');
  });

  test.each(
    'oidc login error scenarios',
    [
      { validateFailed: true },
      { authorizeFormDataFailed: true },
      { authorizeFailed: true },
    ],
    async function (
      assert,
      { validateFailed, authorizeFormDataFailed, authorizeFailed }
    ) {
      this.owner.register('service:notifications', NotificationsStub);

      const tokenValidateResponse = createOidcTokenValidateResponse(
        validateFailed
          ? {
              error: {
                code: 'validate_invalid_token',
                description: 'validate invalid token',
              },
            }
          : {}
      );

      const oidcAuthorizationResponse = createOidcAuthorizeFormResponse();

      oidcAuthorizationResponse.form_data.authorization_needed = true;

      if (authorizeFormDataFailed) {
        oidcAuthorizationResponse.validation_result.error = {
          code: 'authorize_form_invalid_token',
          description: 'authorize form invalid token',
        };
      }

      const oidcAuthorizeResponse = createOidcAuthorizeResponse(
        authorizeFailed
          ? {
              error: {
                code: 'authorize_failed',
                description: 'authorize failed',
              },
              redirect_url: null,
            }
          : {}
      );

      this.server.post(
        '/v2/oidc/authorization/validate',
        () =>
          new Response(validateFailed ? 400 : 200, {}, tokenValidateResponse)
      );

      this.server.post(
        '/v2/oidc/authorization',
        () =>
          new Response(
            authorizeFormDataFailed ? 400 : 200,
            {},
            oidcAuthorizationResponse
          )
      );

      this.server.post(
        '/v2/oidc/authorization/authorize',
        () =>
          new Response(authorizeFailed ? 400 : 200, {}, oidcAuthorizeResponse)
      );

      // create auth session for pre authentication
      await createAuthSession();

      visit(`/dashboard/oidc/redirect?oidc_token=${this.oidcToken}`);

      await waitUntil(() => currentURL()?.includes('/dashboard/oidc/redirect'));

      assert.strictEqual(
        currentURL(),
        `/dashboard/oidc/redirect?oidc_token=${this.oidcToken}`,
        `Redirected to /dashboard/oidc/redirect?oidc_token=${this.oidcToken}`
      );

      const assertErrorPage = async (error) => {
        await waitFor('[data-test-oidc-error]');

        assert.dom('[data-test-error-SvgIcon]').exists();

        assert.dom('[data-test-error-text]').hasText(error.description);

        assert
          .dom('[data-test-error-helperText]')
          .hasText(t('oidcModule.errorHelperText'));
      };

      if (validateFailed) {
        await assertErrorPage(tokenValidateResponse.error);

        return;
      }

      if (authorizeFormDataFailed) {
        await assertErrorPage(
          oidcAuthorizationResponse.validation_result.error
        );

        return;
      }

      await waitUntil(() => currentURL().includes('/dashboard/oidc/authorize'));

      assert.strictEqual(
        currentURL(),
        `/dashboard/oidc/authorize?oidc_token=${this.oidcToken}`,
        `Redirected to /dashboard/oidc/authorize?oidc_token=${this.oidcToken}`
      );

      if (authorizeFailed) {
        await handleUserAuthorizeFlow(assert, oidcAuthorizationResponse, true);

        const notify = this.owner.lookup('service:notifications');

        assert.strictEqual(
          notify.errorMsg,
          oidcAuthorizeResponse.error.description
        );
      }
    }
  );
});
