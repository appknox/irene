import { module, test } from 'qunit';

import { click, currentURL, findAll, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import Service from '@ember/service';
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

module('Acceptance | home page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization } = await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    organization.update({
      features: {
        storeknox: true,
      },
    });

    this.setProperties({
      organization,
    });
  });

  test('it renders', async function (assert) {
    await visit('/dashboard/home');

    assert.dom('[data-test-home-page]').exists();

    assert
      .dom('[data-test-home-page-title]')
      .exists()
      .hasText(t('toSecureYourMobileApps'));

    assert.dom('[data-test-home-page-appLogo]').exists();

    assert
      .dom('[data-test-home-page-logoutBtn]')
      .isNotDisabled()
      .hasText(t('logout'));

    assert.dom('[data-test-home-page-product-card]').exists({
      count: 3,
    });
  });

  test('it redirects to appknox dashboard', async function (assert) {
    await visit('/dashboard/home');

    assert.dom('[data-test-home-page-product-card]').exists({
      count: 3,
    });

    assert.dom('[data-test-home-page-product-card-title]').exists({ count: 3 });

    const titles = this.element.querySelectorAll(
      '[data-test-home-page-product-card-title]'
    );

    assert.strictEqual(titles[0].textContent.trim(), t('vapt'));
    assert.strictEqual(titles[1].textContent.trim(), t('appMonitoring'));
    assert.strictEqual(titles[2].textContent.trim(), t('securityDashboard'));

    const links = this.element.querySelectorAll(
      '[data-test-home-page-product-card-link]'
    );

    assert
      .dom('[data-test-home-page-product-card-indicator-icon]')
      .exists({ count: 3 });

    await click(links[0]);

    assert.strictEqual(
      currentURL(),
      '/dashboard/projects',
      'Redirected to appknox'
    );
  });

  test('it redirects to storeknox dashboard', async function (assert) {
    await visit('/dashboard/home');

    assert.dom('[data-test-home-page-product-card]').exists({
      count: 3,
    });

    const links = this.element.querySelectorAll(
      '[data-test-home-page-product-card-link]'
    );

    assert
      .dom('[data-test-home-page-product-card-indicator-icon]')
      .exists({ count: 3 });

    await click(links[1]);

    assert.strictEqual(
      currentURL(),
      '/dashboard/storeknox/inventory',
      'Redirected to storeknox'
    );
  });

  test('it redirects to appknox dashboard if app monitoring and security is disabled', async function (assert) {
    this.organization.update({
      features: {
        storeknox: false,
      },
    });

    this.server.get('/hudson-api/projects', () => {
      return new Response(404);
    });

    await visit('/dashboard/home');

    assert.strictEqual(
      currentURL(),
      '/dashboard/projects',
      'Redirected to appknox'
    );

    assert.dom('[data-test-side-menu-switcher]').doesNotExist();
  });

  test.each(
    'it should show right product cards',
    [
      { storeknox: true, security: false },
      { storeknox: true, security: true },
      { storeknox: false, security: true },
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

      await visit('/dashboard/home');

      if (products.security && products.storeknox) {
        assert.dom('[data-test-home-page-product-card]').exists({
          count: 3,
        });
      } else if (products.security && !products.storeknox) {
        assert.dom('[data-test-home-page-product-card]').exists({
          count: 2,
        });

        const productTitles = findAll(
          '[data-test-home-page-product-card-title]'
        );

        assert.dom(productTitles[0]).hasText(t('vapt'));

        assert.dom(productTitles[1]).hasText(t('securityDashboard'));
      } else if (!products.security && products.storeknox) {
        assert.dom('[data-test-home-page-product-card]').exists({
          count: 2,
        });

        const productTitles = findAll(
          '[data-test-home-page-product-card-title]'
        );

        assert.dom(productTitles[0]).hasText(t('vapt'));

        assert.dom(productTitles[1]).hasText(t('appMonitoring'));
      }
    }
  );
});
