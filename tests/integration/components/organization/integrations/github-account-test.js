import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';

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

module(
  'Integration | Component | organization/integrations/github-account',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders github-account not integrated', async function (assert) {
      await render(hbs`<Organization::Integrations::GithubAccount />`);

      assert
        .dom('[data-test-org-integration-card-title="Github"]')
        .hasText(t('github'));

      assert
        .dom('[data-test-org-integration-card-description="Github"]')
        .hasText(t('githubIntegrationDesc'));

      assert
        .dom('[data-test-org-integration-card-connectBtn]')
        .isNotDisabled()
        .hasText(t('connect'));

      assert
        .dom('[data-test-org-integration-card-integrated-chip]')
        .doesNotExist();
    });

    test('it renders github-account not integrated & reconnect', async function (assert) {
      await render(
        hbs`<Organization::Integrations::GithubAccount @reconnect={{true}} />`
      );

      assert
        .dom('[data-test-org-integration-card-title="Github"]')
        .hasText(t('github'));

      assert
        .dom('[data-test-org-integration-card-description="Github"]')
        .hasText(t('githubIntegrationDesc'));

      assert
        .dom('[data-test-org-integration-card-connectBtn]')
        .isNotDisabled()
        .hasText(t('connect'));

      assert
        .dom('[data-test-org-integration-card-integrated-chip]')
        .doesNotExist();
    });

    test('it renders github-account integrated', async function (assert) {
      this.setProperties({
        integratedUser: {
          login: 'appknox',
        },
        reconnect: false,
      });

      await render(
        hbs`<Organization::Integrations::GithubAccount @integratedUser={{this.integratedUser}} @reconnect={{this.reconnect}} />`
      );

      assert
        .dom('[data-test-org-integration-card-title="Github"]')
        .hasText(t('github'));

      assert.dom('[data-test-org-integration-card-logo]').exists();

      assert.dom('[data-test-org-integration-card-integrated-chip]').exists();

      assert
        .dom('[data-test-org-integration-card-manageBtn]')
        .exists()
        .containsText(t('manage'));

      await click('[data-test-org-integration-card-manageBtn]');

      assert
        .dom('[data-test-orgIntegrations-integratedUI-hostURL]')
        .hasText('https://github.com');

      assert
        .dom('[data-test-orgIntegrations-integratedUI-property]')
        .hasText(this.integratedUser.login);

      assert
        .dom('[data-test-orgIntegrations-configDrawer-disconnectBtn]')
        .isNotDisabled()
        .hasText(t('disconnect'));
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
          hbs`<Organization::Integrations::GithubAccount @integratedUser={{this.integratedUser}} @reconnect={{this.reconnect}} />`
        );

        assert
          .dom('[data-test-org-integration-card-title="Github"]')
          .hasText(t('github'));

        assert.dom('[data-test-org-integration-card-logo]').exists();

        assert.dom('[data-test-org-integration-card-integrated-chip]').exists();

        assert
          .dom('[data-test-org-integration-card-manageBtn]')
          .exists()
          .containsText(t('manage'));

        await click('[data-test-org-integration-card-manageBtn]');

        assert
          .dom('[data-test-orgIntegrations-integratedUI-hostURL]')
          .hasText('https://github.com');

        assert
          .dom('[data-test-orgIntegrations-integratedUI-property]')
          .hasText(this.integratedUser.login);

        assert
          .dom('[data-test-orgIntegrations-configDrawer-disconnectBtn]')
          .isNotDisabled()
          .hasText(t('disconnect'));

        await click('[data-test-orgIntegrations-configDrawer-disconnectBtn]');

        assert
          .dom('[data-test-orgIntegrations-configDrawer-title]')
          .hasText(t('confirmation'));

        assert
          .dom('[data-test-orgIntegrations-githubAccount-revoke-confirmation]')
          .hasText(t('confirmBox.revokeGithub'));

        assert
          .dom(
            '[data-test-orgIntegrations-githubAccount-disconnectBtnConfirmation]'
          )
          .isNotDisabled()
          .hasText(t('yesDisconnect'));

        assert
          .dom(
            '[data-test-orgIntegrations-githubAccount-cancelBtnConfirmation]'
          )
          .isNotDisabled()
          .hasText(t('cancel'));

        await click(
          '[data-test-orgIntegrations-githubAccount-disconnectBtnConfirmation]'
        );

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, error.detail);

          assert.dom('[data-test-orgIntegrations-configDrawer-title]').exists();
          assert
            .dom(
              '[data-test-orgIntegrations-githubAccount-revoke-confirmation]'
            )
            .exists();
          assert
            .dom(
              '[data-test-orgIntegrations-githubAccount-disconnectBtnConfirmation]'
            )
            .exists();
          assert
            .dom(
              '[data-test-orgIntegrations-githubAccount-cancelBtnConfirmation]'
            )
            .exists();

          assert
            .dom('[data-test-org-integration-card-connectBtn]')
            .doesNotExist();
        } else {
          assert.strictEqual(notify.successMsg, t('githubWillBeRevoked'));

          assert
            .dom('[data-test-orgIntegrations-configDrawer-title]')
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-githubAccount-revoke-confirmation]'
            )
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-githubAccount-disconnectBtnConfirmation]'
            )
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-githubAccount-cancelBtnConfirmation]'
            )
            .doesNotExist();

          assert
            .dom('[data-test-org-integration-card-description="Github"]')
            .hasText(t('githubIntegrationDesc'));

          assert
            .dom('[data-test-org-integration-card-connectBtn]')
            .isNotDisabled()
            .hasText(t('connect'));
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

        await render(hbs`<Organization::Integrations::GithubAccount />`);

        assert
          .dom('[data-test-org-integration-card-connectBtn]')
          .isNotDisabled()
          .hasText(t('connect'));

        assert.notStrictEqual(window.location.hash, data.url);

        await click('[data-test-org-integration-card-connectBtn]');

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
  }
);
