import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { setupRequiredEndpoints } from '../helpers/acceptance-utils';
import { Response } from 'miragejs';

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
    assert.expect(2);
    const notify = this.owner.lookup('service:notifications');
    notify.setDefaultClearDuration(0);

    const loginRedirectUrl = '/login?sessionExpired=true';

    class SessionStub extends Service {
      invalidate() {
        assert.ok(true, 'Session invalidator was called.');
      }
    }

    class WindowStub extends Service {
      url = null;

      location = {
        replace: (url) => {
          // Redirect URL should match
          assert.strictEqual(url, loginRedirectUrl);

          this.url = url;
        },
      };
    }

    this.owner.register('service:session', SessionStub);
    this.owner.register('service:browser/window', WindowStub);

    this.server.get('/organizations', () => {
      return new Response(
        401,
        { 'Content-Type': 'application/json' },
        {
          errors: [
            {
              status: '401',
              title: 'Unauthorized',
              detail: 'Authentication is required to access this resource',
            },
          ],
        }
      );
    });

    this.server.get('/vulnerabilities', () => {
      return new Response(
        401,
        { 'Content-Type': 'application/json' },
        {
          errors: [
            {
              status: '401',
              title: 'Unauthorized',
              detail: 'Authentication is required to access this resource',
            },
          ],
        }
      );
    });

    try {
      await visit('/projects');
    } catch (error) {
      // expected error
    }
  });
});
