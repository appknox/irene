import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

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

module('Acceptance | security/nav menu', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupBrowserFakes(hooks, { window: true });

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    this.server.get('/organizations/:id', (schema, req) =>
      schema.organizationMes.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('organizations/:id/projects', (schema) => {
      const results = schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
    });

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);
  });

  test('it switches nav menu tabs correctly', async function (assert) {
    const window = this.owner.lookup('service:browser/window');

    window.location.href = '/security/projects';

    await visit('/security/projects');

    assert.dom('[data-test-security-nav-menu]').exists();

    assert
      .dom('[data-test-security-nav-menu-item="projects"] a')
      .exists()
      .hasClass(/_active_/i);

    window.location.href = '/security/downloadapp';

    await visit('/security/downloadapp');

    assert
      .dom('[data-test-security-nav-menu-item="downloadapp"] a')
      .exists()
      .hasClass(/_active_/i);

    window.location.href = '/security/purgeanalysis';

    await visit('/security/purgeanalysis');

    assert
      .dom('[data-test-security-nav-menu-item="purgeanalysis"] a')
      .exists()
      .hasClass(/_active_/i);
  });
});
