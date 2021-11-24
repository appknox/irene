import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { Response } from 'miragejs';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  error(msg) {
    return (this.errorMsg = msg);
  }
  success(msg) {
    return (this.successMsg = msg);
  }
}

module('Integration | Component | github-account', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();
    await this.owner.register('service:notifications', NotificationsStub);
  });

  test('it should render title and integrate github account btn by default', async function (assert) {
    await render(hbs`<GithubAccount/>`);

    assert
      .dom(`[data-test-github-account-title]`)
      .hasText(`t:githubIntegration:()`);
    assert
      .dom(`[data-test-github-account-description]`)
      .hasText(`t:githubIntegrationDesc:()`);

    assert.dom(`[data-test-github-account-integrated]`).doesNotExist();
    assert.dom(`[data-test-github-account-reconnect]`).doesNotExist();

    assert
      .dom(`[data-test-github-account-integrate-btn]`)
      .hasText(`t:integrateGithub:()`);
  });

  test('it should render reconnect github account section', async function (assert) {
    this.set('reconnect', true);

    await render(hbs`<GithubAccount @reconnect={{this.reconnect}}/>`);

    assert
      .dom(`[data-test-github-account-description]`)
      .hasText(`t:githubIntegrationReconnectDesc:()`);

    assert.dom(`[data-test-github-account-integrated]`).doesNotExist();
    assert.dom(`[data-test-github-account-integrate]`).doesNotExist();

    assert
      .dom(`[data-test-github-account-reconnect-btn]`)
      .hasText(`t:reconnect:()`);
  });

  test('it should render integrated github account section', async function (assert) {
    this.set('integratedUser', {
      login: 'test user',
    });

    await render(hbs`<GithubAccount @integratedUser={{this.integratedUser}}/>`);

    assert.dom(`[data-test-github-account-reconnect]`).doesNotExist();
    assert.dom(`[data-test-github-account-integrate]`).doesNotExist();

    assert
      .dom(`[data-test-github-account-disconnect-btn]`)
      .hasText(`t:disconnect:()`);

    assert
      .dom(`[data-test-github-account-integrated-github-logo]`)
      .hasAttribute('src', '/images/github-icon.png');
    assert
      .dom(`[data-test-github-account-integrated-github-url]`)
      .hasText('https://github.com');

    assert
      .dom(`[data-test-github-account-integrated-user]`)
      .hasText(this.integratedUser.login);
  });

  test('it should show revoke integration modal after click disconnect btn', async function (assert) {
    this.set('integratedUser', {
      login: 'test user',
    });

    await render(hbs`<GithubAccount @integratedUser={{this.integratedUser}}/>`);

    await click(`[data-test-github-account-disconnect-btn]`);

    assert
      .dom(`[data-test-github-account-confirm-revoke-btn]`)
      .hasText(`t:ok:()`);

    assert
      .dom(`[data-test-github-account-confirm-cancel-btn]`)
      .hasText(`t:cancel:()`);
  });

  test('it should succeed revoke github integration', async function (assert) {
    this.notifyService = this.owner.lookup('service:notifications');
    this.set('integratedUser', {
      login: 'test user',
    });

    this.server.delete(`organizations/:id/github`, () => {
      return new Response(200);
    });

    await render(hbs`<GithubAccount @integratedUser={{this.integratedUser}}/>`);

    await click(`[data-test-github-account-disconnect-btn]`);

    await click(`[data-test-github-account-confirm-revoke-btn]`);

    assert.dom(`[data-test-github-account-confirm-modal]`).doesNotExist();
    assert.equal(
      this.notifyService.get('successMsg'),
      `t:githubWillBeRevoked:()`
    );
  });

  test('it should fail revoke integration', async function (assert) {
    this.notifyService = this.owner.lookup('service:notifications');
    this.set('integratedUser', {
      login: 'test user',
    });

    this.server.delete(`organizations/:id/github`, () => {
      return new Response(500);
    });

    await render(hbs`<GithubAccount @integratedUser={{this.integratedUser}}/>`);

    await click(`[data-test-github-account-disconnect-btn]`);

    await click(`[data-test-github-account-confirm-revoke-btn]`);

    assert.dom(`[data-test-github-account-confirm-modal]`).exists();
    assert.equal(
      this.notifyService.get('errorMsg'),
      `Request was rejected due to server error`
    );
  });

  test('it should toggle revoke integraion modal', async function (assert) {
    this.set('integratedUser', {
      login: 'test user',
    });
    await render(hbs`<GithubAccount @integratedUser={{this.integratedUser}}/>`);
    assert.dom(`[data-test-github-account-confirm-modal]`).doesNotExist();
    await click(`[data-test-github-account-disconnect-btn]`);
    assert.dom(`[data-test-github-account-confirm-modal]`).exists();
    await click(`[data-test-github-account-confirm-cancel-btn]`);
    assert.dom(`[data-test-github-account-confirm-modal]`).doesNotExist();
  });

  skip('skip it should succeed github integration', async function (assert) {
    this.notifyService = this.owner.lookup('service:notifications');
    this.set('reconnect', true);

    this.server.get(`organizations/:id/github/redirect`, () => {
      return { data: { url: 'http://test.com' } };
    });

    await render(hbs`<GithubAccount @reconnect={{this.reconnect}}/>`);

    await click(`[data-test-github-account-reconnect-btn]`);

    assert.equal(window.location.href, 'http://test.com');
  });

  test('it should fail reconnect github integration', async function (assert) {
    this.notifyService = this.owner.lookup('service:notifications');
    this.set('reconnect', true);

    this.server.get(`organizations/:id/github/redirect`, () => {
      return new Response(400);
    });

    await render(hbs`<GithubAccount @reconnect={{this.reconnect}}/>`);

    await click(`[data-test-github-account-reconnect-btn]`);

    assert.equal(
      this.notifyService.get('errorMsg'),
      `t:githubErrorIntegration:()`
    );
  });

  skip('skip it should succeed github integration', async function (assert) {
    this.notifyService = this.owner.lookup('service:notifications');

    this.server.get(`organizations/:id/github/redirect`, () => {
      return new Response(200);
    });

    await render(hbs`<GithubAccount/>`);

    await click(`[data-test-github-account-integrate-btn]`);
    assert.ok(true);
  });

  test('it should fail github integration', async function (assert) {
    this.notifyService = this.owner.lookup('service:notifications');

    this.server.get(`organizations/:id/github/redirect`, () => {
      return new Response(400);
    });

    await render(hbs`<GithubAccount/>`);

    await click(`[data-test-github-account-integrate-btn]`);

    assert.equal(
      this.notifyService.get('errorMsg'),
      `t:githubErrorIntegration:()`
    );
  });
});
