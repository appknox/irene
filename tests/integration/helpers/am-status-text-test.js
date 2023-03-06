import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Helper | am-status-text', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');

    // File Record
    const file = this.server.create('file', 1);

    // Project Record
    const project = this.server.create('project', {
      id: 1,
      last_file_id: file.id,
    });

    // AmAppSync Record
    const amAppSync = this.server.create('am-app-sync', {
      id: 1,
      latest_file: file.id,
    });

    this.setProperties({
      file,
      project,
      amAppSync,
    });

    // Server mocks
    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/am_app_versions/:id', (schema, req) => {
      return schema.amAppVersions.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/am_app_syncs/:id', (schema, req) => {
      return schema.amAppSyncs.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/am_apps/:id', (schema, req) => {
      return schema.amApps.find(`${req.params.id}`)?.toJSON();
    });
  });

  test('it renders the correct status text when amApp is "SCANNED"', async function (assert) {
    // For a "SCANNED" state the latestAmAppVersion and lastSync exist
    // and the lastFile of the latestAmAppVersion exists also.
    const amAppVersion = this.server.create('am-app-version', {
      id: 1,
      latest_file: this.file.id,
    });

    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      last_sync: this.amAppSync.id,
      latest_am_app_version: amAppVersion.id,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`{{am-status-text this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), 't:scanned:()');
  });

  test('it renders the correct status text when amApp is "NOT SCANNED"', async function (assert) {
    // For a "NOT SCANNED" state the latestAmAppVersion and lastSync exist
    // but the lastFile of the latestAmAppVersion is null.
    const amAppVersion = this.server.create('am-app-version', {
      id: 1,
      latest_file: null,
    });

    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      last_sync: this.amAppSync.id,
      latest_am_app_version: amAppVersion.id,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`{{am-status-text this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), 't:notScanned:()');
  });

  test('it renders the correct status text when amApp is "PENDING"', async function (assert) {
    // For a "PENDING" state the latestAmAppVersion and lastSync are null.
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      last_sync: null,
      latest_am_app_version: null,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

    this.amApp = this.store.push(normalizedAmApp);

    this.amApp = await this.store.findRecord('am-app', 1);

    await render(hbs`{{am-status-text this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), 't:pending:()');
  });

  test('it renders the correct status text when amApp is "NOT FOUND"', async function (assert) {
    // For a "NOT FOUND" state the latestAmAppVersion is null.
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      last_sync: this.amAppSync.id,
      latest_am_app_version: null,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`{{am-status-text this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), 't:notFound:()');
  });
});
