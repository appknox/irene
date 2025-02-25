import { module, test } from 'qunit';

import { click, currentURL, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import Service from '@ember/service';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

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

module('Acceptance | notifications test', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupBrowserFakes(hooks, { window: true });

  hooks.beforeEach(async function () {
    const { organization } = await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.setProperties({
      organization,
    });
  });

  test('it redirects to notifications page', async function (assert) {
    await visit('/dashboard/projects');

    assert.dom('[data-test-bell-icon]').exists();

    await click('[data-test-bell-icon]');

    assert.dom('[data-test-notification-dropdown]').exists();

    assert.dom('[data-test-ak-button-mark-all-as-read]').exists();

    assert
      .dom('[data-test-notification-dropdown-link]')
      .exists('Notification dropdown link exists')
      .containsText('View All Notifications');

    await click('[data-test-notification-dropdown-link]');

    assert.strictEqual(currentURL(), '/dashboard/notifications');

    assert.dom('[data-test-notification-page]').exists();
  });
});
