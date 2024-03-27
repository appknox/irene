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

module('Acceptance | Analytics Route Redirect', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);
  });

  test('redirects to authenticated.dashboard.analytics route', async function (assert) {
    this.server.get('organizations/:id/scancount', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.server.get('organizations/:id/recent_issues', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.server.get('organizations/:id/appscan', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    await visit('/analytics');

    assert.strictEqual(currentURL(), '/dashboard/analytics');
  });
});
