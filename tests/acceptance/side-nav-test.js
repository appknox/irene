import { module, test } from 'qunit';

import { click, currentURL, findAll, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import Service from '@ember/service';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { t } from 'ember-intl/test-support';
import { Response } from 'miragejs';

import { setupRequiredEndpoints } from '../helpers/acceptance-utils';

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return false;
  }
}

class WebsocketStub extends Service {
  async connect() {}

  async configure() {}
}

module('Acceptance | side nav test', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupBrowserFakes(hooks, { window: true });

  hooks.beforeEach(async function () {
    const { organization } = await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    const menuItems = [
      { label: 'Store Monitoring', url: '/dashboard/store-monitoring' },
      { label: 'SBOM', url: '/dashboard/sbom/apps?app_offset=0' },
      { label: 'Analytics', url: '/dashboard/analytics' },
      { label: 'Organization', url: '/dashboard/organization/namespaces' },
      { label: 'API Documentation', url: '/dashboard/public-api/docs' },
      { label: 'Account Settings', url: '/dashboard/settings/general' },
      { label: 'Billing', url: '/dashboard/billing' },
    ];

    const notify = this.owner.lookup('service:notifications');

    notify.setDefaultClearDuration(0);

    organization.update({
      features: {
        app_monitoring: true,
        storeknox: true,
        sbom: true,
        public_apis: true,
      },
    });

    this.setProperties({
      organization,
      menuItems,
    });
  });

  test('it renders', async function (assert) {
    await visit('/dashboard/projects');

    assert.dom('[data-test-side-nav]').exists();

    assert.dom('[data-test-img-logo]').exists();
  });

  test('it should show the correct page on click of menu items', async function (assert) {
    assert.expect(14);

    await visit('/dashboard/projects');

    this.server.get('organizations/:id/am_configuration', (schema, req) => {
      return { id: 1, enabled: false, organization: req.params.id };
    });

    this.server.get('organizations/:id/scancount', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.server.get('organizations/:id/recent_issues', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.server.get('organizations/:id/appscan', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.server.get('organizations/:id/invoices', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.server.get('organizations/:id/subscriptions', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.server.get('organizations/:id/plans', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    for (const item of this.menuItems) {
      assert.dom(`[data-test-side-menu-item="${item.label}"]`).exists();

      await click(`[data-test-side-menu-item="${item.label}"] a`);

      assert.strictEqual(currentURL(), item.url);
    }
  });

  test.each(
    'it should switch between VAPT and Store Monitoring',
    [
      {
        expectedUrl: '/dashboard/storeknox/inventory',
        visitUrl: '/dashboard/projects',
        icon: 'sm-svg',
      },
      {
        expectedUrl: '/dashboard/projects',
        visitUrl: '/dashboard/storeknox/inventory',
        icon: 'vapt-svg',
      },
    ],

    async function (assert, details) {
      const window = this.owner.lookup('service:browser/window');

      window.location.href = details.visitUrl;

      await visit(details.visitUrl);

      assert.dom('[data-test-side-menu-switcher]').exists();

      await click('[data-test-side-menu-switcher]');

      assert.dom('[data-test-side-menu-switcher-modal]').exists();

      assert.dom('[data-test-switcher-popover-item-link]').exists();

      assert
        .dom(`[data-test-side-menu-switcher-modal="${details.icon}"]`)
        .exists();

      await click('[data-test-switcher-popover-item-link]');

      assert.strictEqual(currentURL(), details.expectedUrl);
    }
  );

  test.each(
    'it should show product switcher menu items',
    [
      { storeknox: true, security: false },
      { storeknox: true, security: true },
      { storeknox: false, security: true },
      { storeknox: false, security: false },
    ],
    async function (assert, products) {
      this.server.get('/hudson-api/projects', () => {
        return products.security ? new Response(200) : new Response(404);
      });

      this.organization.update({
        features: {
          storeknox: products.storeknox,
        },
      });

      await visit('/dashboard/projects');

      if (!products.security && !products.storeknox) {
        assert.dom('[data-test-side-menu-switcher]').doesNotExist();
      } else {
        assert.dom('[data-test-side-menu-switcher]').exists();

        await click('[data-test-side-menu-switcher]');

        assert.dom('[data-test-side-menu-switcher-modal]').exists();

        if (products.security && products.storeknox) {
          assert
            .dom('[data-test-switcher-popover-item-link]')
            .exists({ count: 2 });

          const items = findAll('[data-test-switcher-popover-item-link]');

          assert.dom(items[0]).hasText(t('appMonitoring'));

          assert.dom(items[1]).hasText(t('securityDashboard'));
        } else if (products.storeknox && !products.security) {
          assert
            .dom('[data-test-switcher-popover-item-link]')
            .exists({ count: 1 })
            .hasText(t('appMonitoring'));
        } else if (!products.storeknox && products.security) {
          assert
            .dom('[data-test-switcher-popover-item-link]')
            .exists({ count: 1 })
            .hasText(t('securityDashboard'));
        }
      }
    }
  );
});
