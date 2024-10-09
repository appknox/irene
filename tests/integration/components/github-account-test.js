import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';

import Service from '@ember/service';

class OrganizationMeStub extends Service {
  org = {
    is_owner: true,
    is_admin: true,
  };
}

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

module('Integration | Component | github-account', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders github-account not integrated', async function (assert) {
    await render(hbs`<GithubAccount />`);

    assert
      .dom('[data-test-githubAccount-title]')
      .hasText(t('githubIntegration'));

    assert
      .dom('[data-test-githubAccount-desc]')
      .hasText(t('githubIntegrationDesc'));

    assert
      .dom('[data-test-githubAccount-integrateBtn]')
      .isNotDisabled()
      .hasText(t('integrateGithub'));

    assert.dom('[data-test-githubAccount-logo]').doesNotExist();
    assert.dom('[data-test-githubAccount-host]').doesNotExist();
    assert.dom('[data-test-githubAccount-userLogin]').doesNotExist();
    assert.dom('[data-test-githubAccount-disconnectBtn]').doesNotExist();
  });

  test('it renders github-account not integrated & reconnect', async function (assert) {
    await render(hbs`<GithubAccount @reconnect={{true}} />`);

    assert
      .dom('[data-test-githubAccount-title]')
      .hasText(t('githubIntegration'));

    assert
      .dom('[data-test-githubAccount-desc]')
      .hasText(t('integrationFailed'));

    assert
      .dom('[data-test-githubAccount-integrateBtn]')
      .isNotDisabled()
      .hasText(t('reconnect'));

    assert.dom('[data-test-githubAccount-logo]').doesNotExist();
    assert.dom('[data-test-githubAccount-host]').doesNotExist();
    assert.dom('[data-test-githubAccount-userLogin]').doesNotExist();
    assert.dom('[data-test-githubAccount-disconnectBtn]').doesNotExist();
  });

  test('it renders github-account integrated', async function (assert) {
    this.setProperties({
      integratedUser: {
        login: 'appknox',
      },
      reconnect: false,
    });

    await render(
      hbs`<GithubAccount @integratedUser={{this.integratedUser}} @reconnect={{this.reconnect}} />`
    );

    assert
      .dom('[data-test-githubAccount-title]')
      .hasText(t('githubIntegration'));

    assert.dom('[data-test-githubAccount-logo]').exists();

    assert.dom('[data-test-githubAccount-host]').hasText('https://github.com');

    assert
      .dom('[data-test-githubAccount-userLogin]')
      .hasText(this.integratedUser.login);

    assert
      .dom('[data-test-githubAccount-disconnectBtn]')
      .isNotDisabled()
      .hasText(t('disconnect'));

    assert.dom('[data-test-githubAccount-desc]').doesNotExist();
    assert.dom('[data-test-githubAccount-integrateBtn]').doesNotExist();
  });

  test.each(
    'it should disconnect github-account',
    [{ fail: false }, { fail: true, error: { detail: 'disconnect error' } }],
    async function (assert, { fail, error }) {
      this.setProperties({
        integratedUser: {
          login: 'appknox',
        },
        reconnect: false,
      });

      this.server.delete('/organizations/:id/github', () => {
        return fail ? new Response(500, {}, error) : {};
      });

      await render(
        hbs`<GithubAccount @integratedUser={{this.integratedUser}} @reconnect={{this.reconnect}} />`
      );

      assert
        .dom('[data-test-githubAccount-title]')
        .hasText(t('githubIntegration'));

      assert
        .dom('[data-test-githubAccount-disconnectBtn]')
        .isNotDisabled()
        .hasText(t('disconnect'));

      await click('[data-test-githubAccount-disconnectBtn]');

      assert.dom('[data-test-ak-modal-header]').hasText(t('confirm'));

      assert
        .dom('[data-test-confirmbox-description]')
        .hasText(t('confirmBox.revokeGithub'));

      assert
        .dom('[data-test-confirmbox-confirmBtn]')
        .isNotDisabled()
        .hasText(t('disconnect'));

      assert
        .dom('[data-test-confirmbox-cancelBtn]')
        .isNotDisabled()
        .hasText(t('cancel'));

      await click('[data-test-confirmbox-confirmBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, error.detail);

        assert.dom('[data-test-ak-modal-header]').exists();
        assert.dom('[data-test-confirmbox-description]').exists();
        assert.dom('[data-test-confirmbox-confirmBtn]').exists();
        assert.dom('[data-test-confirmbox-cancelBtn]').exists();

        assert.dom('[data-test-githubAccount-desc]').doesNotExist();
        assert.dom('[data-test-githubAccount-integrateBtn]').doesNotExist();
      } else {
        assert.strictEqual(notify.successMsg, t('githubWillBeRevoked'));

        assert.dom('[data-test-ak-modal-header]').doesNotExist();
        assert.dom('[data-test-confirmbox-description]').doesNotExist();
        assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
        assert.dom('[data-test-confirmbox-cancelBtn]').doesNotExist();

        assert
          .dom('[data-test-githubAccount-desc]')
          .hasText(t('githubIntegrationDesc'));

        assert
          .dom('[data-test-githubAccount-integrateBtn]')
          .isNotDisabled()
          .hasText(t('integrateGithub'));
      }
    }
  );

  test.each(
    'it should redirect to integrate github-account',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      // # to prevent browser refresh
      const data = { url: '#https://api.github.com' };

      this.server.get('/organizations/:id/github/redirect', () => {
        return fail ? new Response(500) : data;
      });

      await render(hbs`<GithubAccount />`);

      assert
        .dom('[data-test-githubAccount-integrateBtn]')
        .isNotDisabled()
        .hasText(t('integrateGithub'));

      assert.notStrictEqual(window.location.hash, data.url);

      await click('[data-test-githubAccount-integrateBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, t('githubErrorIntegration'));
        assert.notStrictEqual(window.location.hash, data.url);
      } else {
        assert.strictEqual(window.location.hash, data.url);

        // clean up
        window.location.hash = '';
      }
    }
  );
});
