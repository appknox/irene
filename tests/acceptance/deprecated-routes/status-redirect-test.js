import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';

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

module('Acceptance | Status Route Redirect', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    // Network stub
    const DEVICE_FARM_URL = 'https://example-device-farm-url.appknox.com';

    this.server.get('/v2/dashboard_configuration', () => {
      return {
        devicefarm_url: DEVICE_FARM_URL,
      };
    });

    this.server.get(`${DEVICE_FARM_URL}/devicefarm/ping`, () => {
      return new Response(200, {}, { ping: 'pong' });
    });
  });

  test('redirects to dashboard/status route', async function (assert) {
    await visit('/status');

    assert.strictEqual(currentURL(), '/dashboard/status');
  });
});
