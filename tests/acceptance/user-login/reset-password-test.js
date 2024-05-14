import { module, test } from 'qunit';

import { visit, fillIn, click } from '@ember/test-helpers';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { faker } from '@faker-js/faker';
import { Response } from 'miragejs';

module('Acceptance | user-login/reset-password', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const token = (length) => faker.string.alphanumeric({ length });

    this.setProperties({
      token: encodeURIComponent(`${token(234)}`),
    });
  });

  test('it renders reset password page', async function (assert) {
    assert.expect(5);

    this.server.get(`/v2/forgot_password/${this.token}`, () => {
      return new Response(200);
    });

    await visit(`/reset/${this.token}`);

    assert
      .dom('[data-test-user-login-reset-password-header-text]')
      .exists()
      .hasText(t('resetPasswordLabel'));

    assert
      .dom('[data-test-user-login-reset-password-new-password-input]')
      .exists();

    assert
      .dom('[data-test-user-login-reset-password-confirm-password-input]')
      .exists();

    assert.dom('[data-test-user-login-reset-password-reset-btn]').exists();
  });

  test('it renders reset password page with invalid token', async function (assert) {
    assert.expect(4);

    this.server.get(`/v2/forgot_password/${this.token}`, () => {
      return new Response(404);
    });

    await visit(`/reset/${this.token}`);

    assert
      .dom('[data-test-user-login-reset-password-header-text]')
      .exists()
      .hasText(t('resetPasswordLabel'));

    assert
      .dom('[data-test-user-login-reset-password-invalid-link-text]')
      .exists()
      .hasText(t('invalidPasswordResetLink'));
  });

  test('it gives different validation errors', async function (assert) {
    assert.expect(6);

    this.server.get(`/v2/forgot_password/${this.token}`, () => {
      return new Response(200);
    });

    await visit(`/reset/${this.token}`);

    await fillIn(
      '[data-test-user-login-reset-password-new-password-input]',
      'test'
    );

    await fillIn(
      '[data-test-user-login-reset-password-confirm-password-input]',
      'test1'
    );

    assert
      .dom('[data-test-user-login-reset-password-confirm-password-input-error]')
      .exists()
      .containsText("Confirm password doesn't match password");

    await fillIn(
      '[data-test-user-login-reset-password-new-password-input]',
      ''
    );

    assert
      .dom('[data-test-user-login-reset-password-new-password-input-error]')
      .exists()
      .containsText("Password can't be blank");

    await fillIn(
      '[data-test-user-login-reset-password-new-password-input]',
      'test'
    );

    await fillIn(
      '[data-test-user-login-reset-password-confirm-password-input]',
      'test'
    );

    assert
      .dom('[data-test-user-login-reset-password-new-password-input-error]')
      .doesNotExist();

    assert
      .dom('[data-test-user-login-reset-password-confirm-password-input-error]')
      .doesNotExist();
  });

  test('it successfully changes the password', async function (assert) {
    assert.expect(2);

    this.server.get(`/v2/forgot_password/${this.token}`, () => {
      return new Response(200);
    });

    this.server.put(`/v2/forgot_password/${this.token}`, () => {
      return new Response(204);
    });

    await visit(`/reset/${this.token}`);

    await fillIn(
      '[data-test-user-login-reset-password-new-password-input]',
      'test@123456'
    );

    await fillIn(
      '[data-test-user-login-reset-password-confirm-password-input]',
      'test@123456'
    );

    await click('[data-test-user-login-reset-password-reset-btn]');

    assert
      .dom('[data-test-user-login-header-text]')
      .exists()
      .hasText(t('loginTitle'));
  });
});
