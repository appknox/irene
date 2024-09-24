import { module, test } from 'qunit';

import { click, currentURL, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import Service from '@ember/service';

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
        app_monitoring: true,
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
      count: 2,
    });
  });

  test('it redirects to appknox dashboard', async function (assert) {
    await visit('/dashboard/home');

    assert.dom('[data-test-home-page-product-card]').exists({
      count: 2,
    });

    assert.dom('[data-test-home-page-product-card-title]').exists({ count: 2 });

    const titles = this.element.querySelectorAll(
      '[data-test-home-page-product-card-title]'
    );

    assert.strictEqual(titles[0].textContent.trim(), t('appknox'));
    assert.strictEqual(titles[1].textContent.trim(), t('storeknoxTitle'));

    const links = this.element.querySelectorAll(
      '[data-test-home-page-product-card-link]'
    );

    assert
      .dom('[data-test-home-page-product-card-indicator-icon]')
      .exists({ count: 2 });

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
      count: 2,
    });

    const links = this.element.querySelectorAll(
      '[data-test-home-page-product-card-link]'
    );

    assert
      .dom('[data-test-home-page-product-card-indicator-icon]')
      .exists({ count: 2 });

    await click(links[1]);

    assert.strictEqual(
      currentURL(),
      '/dashboard/storeknox/discover/result',
      'Redirected to storeknox'
    );
  });

  test('it redirects to appknox dashboard if app monitoring is disabled', async function (assert) {
    this.organization.update({
      features: {
        app_monitoring: false,
      },
    });

    await visit('/dashboard/home');

    assert.strictEqual(
      currentURL(),
      '/dashboard/projects',
      'Redirected to appknox'
    );

    assert.dom('[data-test-side-menu-switcher]').doesNotExist();
  });
});
