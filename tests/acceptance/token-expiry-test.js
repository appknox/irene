import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
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

module('Acceptance | Token Expiry Redirect', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);
  });

  test('redirects to login if token expires', async function (assert) {
    const loginRedirectUrl = '/login?sessionExpired=true';

    class SessionStub extends Service {
      invalidate() {}
    }

    let replacedUrl = null;
    class WindowStub extends Service {
      location = {
        replace: (url) => {
          replacedUrl = url;
        },
      };
    }

    this.owner.register('service:session', SessionStub);
    this.owner.register('service:browser/window', WindowStub);

    // Fake API returns 401
    this.server.get('/organizations', () => {
      return new Response(
        401,
        { 'Content-Type': 'application/json' },
        'Unauthorized'
      );
    });

    try {
      await visit('/projects');
    } catch (e) {
      // ignore
    }

    assert.strictEqual(replacedUrl, loginRedirectUrl);
  });

  test('redirects to login if user inactive', async function (assert) {
    const loginRedirectUrl = '/login?userInactive=true';

    class SessionStub extends Service {
      invalidate() {}
    }

    let replacedUrl = null;
    class WindowStub extends Service {
      location = {
        replace: (url) => {
          replacedUrl = url;
        },
      };
    }

    this.owner.register('service:session', SessionStub);
    this.owner.register('service:browser/window', WindowStub);

    // Fake API returns inactive user error
    this.server.get('/organizations', () => {
      return new Response(
        401,
        { 'Content-Type': 'text/plain' },
        'User inactive or deleted.'
      );
    });

    try {
      await visit('/projects');
    } catch (e) {
      // ignore
    }

    assert.strictEqual(replacedUrl, loginRedirectUrl);
  });
});
