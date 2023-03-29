import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | am-status-condition', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

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

  test('it renders "success" condition when amApp status is "SCANNED"', async function (assert) {
    // For a "SCANNED" state the relevantAmAppVersion and lastSync exist
    // and the lastFile of the relevantAmAppVersion exists also.
    const amAppVersion = this.server.create('am-app-version', {
      id: 1,
      latest_file: this.file.id,
    });

    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      last_sync: this.amAppSync.id,
      relevant_am_app_version: amAppVersion.id,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`{{am-status-condition this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), 'success');
  });

  test('it renders "error" when amApp status is "NOT SCANNED"', async function (assert) {
    // For a "NOT SCANNED" state the relevantAmAppVersion and lastSync exist
    // but the lastFile of the relevantAmAppVersion is null.
    const amAppVersion = this.server.create('am-app-version', {
      id: 1,
      latest_file: null,
    });

    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      last_sync: this.amAppSync.id,
      relevant_am_app_version: amAppVersion.id,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`{{am-status-condition this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), 'error');
  });

  test('it renders "warn" when amApp status is "PENDING"', async function (assert) {
    // For a "PENDING" state the relevantAmAppVersion and lastSync are null.
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      last_sync: null,
      relevant_am_app_version: null,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`{{am-status-condition this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), 'warn');
  });

  test('it renders "error" when amApp status is "NOT FOUND"', async function (assert) {
    // For a "NOT FOUND" state the relevantAmAppVersion is null.
    const amApp = this.server.create('am-app', {
      id: 1,
      project: this.project.id,
      last_sync: this.amAppSync.id,
      relevant_am_app_version: null,
    });

    const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

    this.amApp = this.store.push(normalizedAmApp);

    await render(hbs`{{am-status-condition this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), 'error');
  });
});
