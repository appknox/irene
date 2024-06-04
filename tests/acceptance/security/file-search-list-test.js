import { module, test } from 'qunit';
import { visit, findAll, find } from '@ember/test-helpers';
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

module('Acceptance | security/file-search-list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    const project = this.server.create('project');

    const files = this.server.createList('file', 3, {
      project: project.id,
    });

    this.server.get('hudson-api/projects/:id/files', (schema) => {
      const files = schema.files.all().models;

      return {
        count: files.length,
        next: null,
        previous: null,
        results: files,
      };
    });

    this.setProperties({
      files,
      id: files[0].id,
    });

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);
  });

  test('it shows file search list page with elements', async function (assert) {
    await visit(`/security/${this.id}/files`);

    assert
      .dom('[data-test-security-file-search-list-heading]')
      .exists()
      .hasText('List of Files');

    assert
      .dom('[data-test-security-file-search-list-description]')
      .exists()
      .hasText('Here you can view all the files of a selected project.');
  });

  test('it renders file list', async function (assert) {
    await visit(`/security/${this.id}/files`);

    assert.dom('[data-test-security-file-list-table]').exists();

    const headerRow = find(
      '[data-test-security-file-list-thead] tr'
    ).querySelectorAll('th');

    // assert header row
    assert.dom(headerRow[0]).hasText('File ID');
    assert.dom(headerRow[1]).hasText('File Name');
    assert.dom(headerRow[2]).hasText('View');
    assert.dom(headerRow[3]).hasText('Download');

    const contentRows = findAll('[data-test-security-file-list-row]');

    assert.strictEqual(contentRows.length, this.files.length);
  });

  test('it goes to view file page on click', async function (assert) {
    await visit(`/security/${this.id}/files`);

    assert.dom('[data-test-file-list-view-file-btn]').exists();

    const viewFileBtn = findAll('[data-test-file-list-view-file-btn]');

    assert
      .dom(viewFileBtn[1])
      .hasTagName('a')
      .hasAttribute('href', `/security/file/${this.files[1].id}`)
      .hasText('View');
  });
});
