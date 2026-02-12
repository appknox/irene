import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL, findAll } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import Service from '@ember/service';
import dayjs from 'dayjs';

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

module('Acceptance | Subscription Page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization } = await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.server.get('/v3/projects', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.setProperties({ organization });
  });

  test('subscription page displays API data correctly in UI', async function (assert) {
    this.organization.update({
      show_subscription: true,
    });

    const apiData = this.server.create('subscription-info');

    // Server Mocks
    this.server.get('/organizations/:id/subscription-info', (schema, request) =>
      schema.subscriptionInfos.find(request.params.id).toJSON()
    );

    await visit('/dashboard/subscription');

    assert.strictEqual(
      currentURL(),
      '/dashboard/subscription',
      'Successfully navigated to subscription page'
    );

    // Verify page renders
    assert
      .dom('[data-test-subscription-page-header]')
      .exists('Subscription page header renders');

    assert
      .dom('[data-test-subscription-page-header] h5')
      .hasText(t('subscriptionDetails'));

    const items = findAll('[data-test-subscription-item]');

    assert.strictEqual(items.length, 4, 'Renders 4 subscription items');

    // Sanity check: Verify API data matches UI display
    // Start date from API should be formatted and displayed
    assert
      .dom(`[data-test-subscription-item="${t('subscriptionStartDate')}"]`)
      .containsText(t('subscriptionStartDate'))
      .containsText(dayjs(apiData.start_date).format('MMM DD, YYYY'));

    // Expiry date from API should be formatted and displayed
    assert
      .dom(`[data-test-subscription-item="${t('subscriptionEndDate')}"]`)
      .containsText(t('subscriptionEndDate'))
      .containsText(dayjs(apiData.expiry_date).format('MMM DD, YYYY'));

    // Original licenses from API should be displayed
    assert
      .dom(`[data-test-subscription-item="${t('licensesProcured')}"]`)
      .containsText(t('licensesProcured'))
      .containsText(String(apiData.original_licenses));

    // Licenses remaining from API should be displayed
    assert
      .dom(`[data-test-subscription-item="${t('licensesRemaining')}"]`)
      .containsText(t('licensesRemaining'))
      .containsText(String(apiData.licenses_remaining));
  });

  test('redirects to projects page if subscription is not enabled', async function (assert) {
    this.organization.update({
      show_subscription: false,
    });

    await visit('/dashboard/subscription');

    assert.strictEqual(currentURL(), '/dashboard/projects');

    assert.dom('[data-test-subscription-page]').doesNotExist();
  });
});
