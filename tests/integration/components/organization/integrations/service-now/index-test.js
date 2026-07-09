import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';

// ── Stubs ────────────────────────────────────────────────────────────────────

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

class RouterStub extends Service {
  transitionedTo = null;

  transitionTo(routeName) {
    this.transitionedTo = routeName;
  }
}

// ── Selectors ────────────────────────────────────────────────────────────────

const selectors = {
  cardTitle: '[data-test-org-integration-card-title="ServiceNow"]',
  cardDescription: '[data-test-org-integration-card-description="ServiceNow"]',
  connectBtn: '[data-test-org-integration-card-connectBtn]',
  manageBtn: '[data-test-org-integration-card-manageBtn]',
};

// ── Template ─────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`<Organization::Integrations::ServiceNow />`;

const DETAIL_ROUTE =
  'authenticated.dashboard.organization-settings.service-now';

// ── Module ───────────────────────────────────────────────────────────────────

module(
  'Integration | Component | organization/integrations/service-now/index',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);
      await this.owner.lookup('service:organization').load();

      this.owner.register('service:notifications', NotificationsStub);
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);
    });

    // ── checkIntegration branches ─────────────────────────────────────────

    test('it renders not-integrated card on 404', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      await render(TEMPLATE);

      assert.dom(selectors.cardTitle).hasText(t('serviceNow.newTitle'));

      assert
        .dom(selectors.cardDescription)
        .hasText(t('serviceNowIntegrationDesc'));

      assert.dom(selectors.connectBtn).isNotDisabled().hasText(t('connect'));

      assert.dom(selectors.manageBtn).doesNotExist();
    });

    test('it renders integrated card when is_complete is true', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => ({
        instance_url: 'https://myinstance.service-now.com',
        username: 'admin',
        is_complete: true,
      }));

      await render(TEMPLATE);

      assert.dom(selectors.cardTitle).hasText(t('serviceNow.newTitle'));
      assert.dom(selectors.manageBtn).isNotDisabled().hasText(t('manage'));
      assert.dom(selectors.connectBtn).doesNotExist();
    });

    test('it renders not-integrated when is_complete is false (partial save)', async function (assert) {
      // Step 1 credentials saved but Step 2 not yet completed.
      this.server.get('/organizations/:id/servicenow', () => ({
        instance_url: 'https://myinstance.service-now.com',
        username: 'admin',
        is_complete: false,
      }));

      await render(TEMPLATE);

      assert.dom(selectors.connectBtn).isNotDisabled().hasText(t('connect'));
      assert.dom(selectors.manageBtn).doesNotExist();
    });

    // ── Navigation ────────────────────────────────────────────────────────

    test('it navigates to detail route when connect is clicked (not integrated)', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => new Response(404));

      await render(TEMPLATE);

      const router = this.owner.lookup('service:router');

      assert.strictEqual(
        router.transitionedTo,
        null,
        'no navigation before click'
      );

      await click(selectors.connectBtn);

      assert.strictEqual(
        router.transitionedTo,
        DETAIL_ROUTE,
        'navigates to service-now detail route'
      );
    });

    test('it navigates to detail route when manage is clicked (integrated)', async function (assert) {
      this.server.get('/organizations/:id/servicenow', () => ({
        instance_url: 'https://myinstance.service-now.com',
        username: 'admin',
        is_complete: true,
      }));

      await render(TEMPLATE);

      const router = this.owner.lookup('service:router');

      assert.strictEqual(
        router.transitionedTo,
        null,
        'no navigation before click'
      );

      await click(selectors.manageBtn);

      assert.strictEqual(
        router.transitionedTo,
        DETAIL_ROUTE,
        'navigates to service-now detail route'
      );
    });
  }
);
