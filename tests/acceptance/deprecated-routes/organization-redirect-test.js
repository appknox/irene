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

module('Acceptance | organization redirect', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);

    this.owner.register('service:websocket', WebsocketStub);
  });

  test('It redirects to authenticated.dashboard.organization route', async function (assert) {
    await visit('/organization/namespaces');

    assert.strictEqual(currentURL(), '/dashboard/organization/namespaces');

    await visit('/organization/users');

    assert.strictEqual(currentURL(), '/dashboard/organization/users');

    await visit('/organization/teams');

    assert.strictEqual(currentURL(), '/dashboard/organization/teams');

    await visit('/organization/settings');

    assert.strictEqual(currentURL(), '/dashboard/organization/settings');
  });
});
