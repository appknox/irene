import { module, test } from 'qunit';
import { visit, findAll, fillIn, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

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

module('Acceptance | security/project-search-list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    const projects = this.server.createList('project', 5);

    this.setProperties({
      projects,
    });

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);
  });

  test('it search within the list', async function (assert) {
    this.server.get('/hudson-api/projects', (schema, req) => {
      this.set('searchQuery', req.queryParams.q);

      const results = req.queryParams.q
        ? schema.projects.where((p) =>
            p.package_name.toLowerCase().includes(this.searchQuery)
          ).models
        : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await visit('/security/projects');

    assert.dom('[data-test-security-project-list-table]').exists();

    let contentRows = findAll('[data-test-security-project-list-row]');

    assert.strictEqual(contentRows.length, this.projects.length);

    await fillIn(
      '[data-test-security-project-search-list-input]',
      this.projects[0].package_name
    );

    assert.dom('[data-test-security-project-list-table]').exists();

    contentRows = findAll('[data-test-security-project-list-row]');

    assert.strictEqual(contentRows.length, 1);
  });

  test('it goes to file page on click', async function (assert) {
    this.server.get('/hudson-api/projects', (schema, req) => {
      this.set('searchQuery', req.queryParams.q);

      const results = req.queryParams.q
        ? schema.projects.where((p) =>
            p.package_name.toLowerCase().includes(this.searchQuery)
          ).models
        : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await visit('/security/projects');

    assert.dom('[data-test-project-search-list-view-file-btn]').exists();

    const viewFileBtn = findAll(
      '[data-test-project-search-list-view-file-btn]'
    );

    await click(viewFileBtn[3]);

    assert.strictEqual(currentURL(), `/security/${this.projects[3].id}/files`);
  });
});
