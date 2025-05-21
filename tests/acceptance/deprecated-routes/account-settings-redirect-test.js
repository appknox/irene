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

module('Acceptance | account settings redirect', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.server.get('/v2/mfa', () => {
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    });
  });

  test('It redirects to authenticated.dashboard.account-settings route', async function (assert) {
    await visit('/settings');

    assert.strictEqual(currentURL(), '/dashboard/settings/general');

    await visit('/settings/general');
    assert.strictEqual(currentURL(), '/dashboard/settings/general');

    await visit('/settings/security');
    assert.strictEqual(currentURL(), '/dashboard/settings/security');

    await visit('/settings/developersettings');
    assert.strictEqual(currentURL(), '/dashboard/settings/developersettings');
  });
});
