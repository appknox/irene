import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, find } from '@ember/test-helpers';
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

const assertNonIntegratedUI = async (assert) => {
  assert
    .dom('[data-test-org-integration-card-description="Slack"]')
    .hasText(t('slackIntegrationDesc'));

  assert
    .dom('[data-test-org-integration-card-connectBtn]')
    .isNotDisabled()
    .hasText(t('connect'));

  await click('[data-test-org-integration-card-connectBtn]');

  assert
    .dom('[data-test-orgIntegrations-slack-channelIdInput]')
    .isNotDisabled()
    .hasNoValue();

  assert
    .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
    .isNotDisabled()
    .hasText(t('integrate'));

  // Integrated UI should not be visible
  assert.dom('[data-test-orgIntegrations-integratedUI-logo]').doesNotExist();

  assert.dom('[data-test-orgIntegrations-integratedUI-hostURL]').doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-integratedUI-property]')
    .doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-configDrawer-disconnectBtn]')
    .doesNotExist();
};

const assertIntegratedUI = async (assert, slackIntegrationInfo) => {
  assert.dom('[data-test-org-integration-card-description="Slack"]').exists();

  assert
    .dom('[data-test-org-integration-card-manageBtn]')
    .isNotDisabled()
    .hasText(t('manage'));

  await click('[data-test-org-integration-card-manageBtn]');

  assert.dom('[data-test-orgIntegrations-slack-channelIdInput]').doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
    .doesNotExist();

  // Test integrated header
  assert.dom('[data-test-orgIntegrations-integratedUI-logo]').exists();

  assert.dom('[data-test-orgIntegrations-integratedUI-hostURL]').doesNotExist();

  assert
    .dom('[data-test-orgIntegrations-integratedUI-property]')
    .hasText(slackIntegrationInfo.channel_id);

  assert
    .dom('[data-test-orgIntegrations-configDrawer-disconnectBtn]')
    .isNotDisabled()
    .hasText(t('disconnect'));
};

module(
  'Integration | Component | organization/integrations/slack',
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

    test('it renders Slack not integrated', async function (assert) {
      assert.expect();

      this.server.get('/organizations/:id/slack', () => {
        return new Response(404);
      });

      await render(hbs`<Organization::Integrations::Slack />`);

      assert
        .dom('[data-test-org-integration-card-title="Slack"]')
        .hasText(t('slack.title'));

      await assertNonIntegratedUI(assert);
    });

    test('it renders Slack integrated', async function (assert) {
      assert.expect();

      const slackIntegrationInfo = {
        channel_id: 'C12345678',
        api_token: 'xoxb-1234567890-0987654321-ABCDEF123456',
      };

      this.server.get('/organizations/:id/slack', () => {
        return slackIntegrationInfo;
      });

      await render(hbs`<Organization::Integrations::Slack />`);

      assertIntegratedUI(assert, slackIntegrationInfo);

      assert
        .dom('[data-test-org-integration-card-title="Slack"]')
        .hasText(t('slack.title'));
    });

    test('it shows edit button and allows editing channel id in integrated mode', async function (assert) {
      const slackIntegrationInfo = {
        channel_id: 'C12345678',
        api_token: 'xoxb-1234567890-0987654321-ABCDEF123456',
      };

      this.server.get('/organizations/:id/slack', () => {
        return slackIntegrationInfo;
      });

      this.server.post('/organizations/:id/slack', (_, req) => {
        const requestBody = JSON.parse(req.requestBody);

        return requestBody;
      });

      await render(hbs`<Organization::Integrations::Slack />`);

      await click('[data-test-org-integration-card-manageBtn]');

      // Initially should show read-only values
      assert
        .dom('[data-test-orgIntegrations-integratedUI-property]')
        .hasText(slackIntegrationInfo.channel_id);

      // Edit button should be visible
      assert
        .dom('[data-test-orgIntegrations-integratedUI-slack-editBtn]')
        .exists()
        .isNotDisabled();

      // Save button should not be visible initially
      assert
        .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
        .doesNotExist();

      // Click edit button
      await click('[data-test-orgIntegrations-integratedUI-slack-editBtn]');

      // Edit button should be hidden
      assert
        .dom('[data-test-orgIntegrations-integratedUI-slack-editBtn]')
        .doesNotExist();

      assert.dom('[data-test-orgIntegrations-slack-channelIdInput]').exists();

      // Read-only text should be hidden
      assert.dom('[data-test-orgIntegrations-slack-channelId]').doesNotExist();

      // Save changes
      await click('[data-test-orgIntegrations-configDrawer-saveBtn]');

      // Should return to read-only mode
      assert
        .dom('[data-test-orgIntegrations-integratedUI-slack-editBtn]')
        .exists();

      assert
        .dom('[data-test-orgIntegrations-slack-channelIdInput]')
        .doesNotExist();

      assert
        .dom('[data-test-orgIntegrations-configDrawer-saveBtn]')
        .doesNotExist();
    });

    test.each(
      'it should disconnect Slack integration',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        const slackIntegrationInfo = {
          channel_id: 'C12345678',
          api_token: 'xoxb-1234567890-0987654321-ABCDEF123456',
        };

        this.set('notIntegratedRes', false);

        this.server.get('/organizations/:id/slack', () => {
          if (this.notIntegratedRes) {
            return new Response(404);
          }

          this.set('notIntegratedRes', true);

          return slackIntegrationInfo;
        });

        this.server.delete('/organizations/:id/slack', () => {
          return fail ? new Response(500) : new Response(200, {}, {});
        });

        await render(hbs`<Organization::Integrations::Slack />`);

        assert
          .dom('[data-test-org-integration-card-title="Slack"]')
          .hasText(t('slack.title'));

        assert
          .dom('[data-test-org-integration-card-manageBtn]')
          .isNotDisabled()
          .hasText(t('manage'));

        await click('[data-test-org-integration-card-manageBtn]');

        const disconnectBtn = find(
          '[data-test-orgIntegrations-configDrawer-disconnectBtn]'
        );

        assert.dom(disconnectBtn).isNotDisabled().hasText(t('disconnect'));

        await click(disconnectBtn);

        assert
          .dom('[data-test-orgIntegrations-configDrawer-title]')
          .hasText(t('confirmation'));

        assert
          .dom('[data-test-orgIntegrations-slackAccount-revoke-confirmation]')
          .hasText(t('confirmBox.revokeSlack'));

        assert
          .dom(
            '[data-test-orgIntegrations-slackAccount-disconnectBtnConfirmation]'
          )
          .isNotDisabled()
          .hasText(t('yesDisconnect'));

        assert
          .dom('[data-test-orgIntegrations-slackAccount-cancelBtnConfirmation]')
          .isNotDisabled()
          .hasText(t('cancel'));

        await click(
          '[data-test-orgIntegrations-slackAccount-disconnectBtnConfirmation]'
        );

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));

          assert.dom('[data-test-orgIntegrations-configDrawer-title]').exists();
          assert
            .dom('[data-test-orgIntegrations-slackAccount-revoke-confirmation]')
            .exists();
          assert
            .dom(
              '[data-test-orgIntegrations-slackAccount-disconnectBtnConfirmation]'
            )
            .exists();
          assert
            .dom(
              '[data-test-orgIntegrations-slackAccount-cancelBtnConfirmation]'
            )
            .exists();

          await click(
            '[data-test-orgIntegrations-slackAccount-cancelBtnConfirmation]'
          );

          assertIntegratedUI(assert, slackIntegrationInfo);
        } else {
          assert.strictEqual(notify.successMsg, t('slack.willBeRevoked'));

          assert
            .dom('[data-test-orgIntegrations-slackAccount-revoke-confirmation]')
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-slackAccount-disconnectBtnConfirmation]'
            )
            .doesNotExist();
          assert
            .dom(
              '[data-test-orgIntegrations-slackAccount-cancelBtnConfirmation]'
            )
            .doesNotExist();

          await assertNonIntegratedUI(assert);
        }
      }
    );

    test('it should validate Slack inputs', async function (assert) {
      this.server.get('/organizations/:id/slack', () => {
        return new Response(404, {}, {});
      });

      await render(hbs`<Organization::Integrations::Slack />`);

      assert
        .dom('[data-test-org-integration-card-connectBtn]')
        .isNotDisabled()
        .hasText(t('connect'));

      await click('[data-test-org-integration-card-connectBtn]');

      assert
        .dom('[data-test-orgIntegrations-configDrawer-integrateBtn]')
        .isNotDisabled()
        .hasText(t('integrate'));

      const notify = this.owner.lookup('service:notifications');

      await click('[data-test-orgIntegrations-configDrawer-integrateBtn]');

      assert.strictEqual(notify.errorMsg, "Channel id can't be blank");
    });

    test.each(
      'it should redirect to integrate Slack',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.set('notIntegratedRes', true);

        const slackIntegrationInfo = {
          channel_id: 'C12345678',
          api_token: 'xoxb-1234567890-0987654321-ABCDEF123456',
        };

        const data = { url: '#https://api.github.com' };

        // Server Mocks
        this.server.get('/organizations/:id/slack', () => {
          if (this.notIntegratedRes) {
            return new Response(404);
          }

          return slackIntegrationInfo;
        });

        this.server.post('/organizations/:id/slack', (_, req) => {
          const requestBody = JSON.parse(req.requestBody);

          if (!fail) {
            this.set('notIntegratedRes', false);
          }

          return fail ? new Response(400) : requestBody;
        });

        this.server.get('/organizations/:id/slack/redirect', () => {
          return fail ? new Response(500) : data;
        });

        // Test start
        await render(hbs`<Organization::Integrations::Slack />`);

        await assertNonIntegratedUI(assert);

        await fillIn(
          '[data-test-orgIntegrations-slack-channelIdInput]',
          slackIntegrationInfo.channel_id
        );

        assert
          .dom('[data-test-orgIntegrations-slack-channelIdInput]')
          .hasValue(slackIntegrationInfo.channel_id);

        await click('[data-test-orgIntegrations-configDrawer-integrateBtn] ');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, 'Failed, please try again');
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
