import { module, test } from 'qunit';
import { currentURL, click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from '../helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

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

module('Acceptance | file compare', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    const project = this.server.create('project');
    const profile = this.server.create('profile');

    // File Models
    const files = this.server.createList('file', 3, {
      project: project.id,
      profile: profile.id,
    });

    // Unknown Analysis Status
    this.server.createList('unknown-analysis-status', 3, {
      status: true,
    });

    this.server.get('/organizations/:id', (schema, req) =>
      schema.organizationMes.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/projects/:id/files', (schema) => {
      const files = schema.files.all().models;

      return {
        count: files.length,
        next: null,
        previous: null,
        results: files,
      };
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return {
        ...schema.projects.find(req.params.id).toJSON(),
        last_file_id: files[files.length - 1].id,
      };
    });

    this.server.get('/profiles/:id', (schema, req) =>
      schema.profiles.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return {
        id: req.params.id,
        status: true,
      };
    });

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.setProperties({
      project,
      fileOld: files[0],
      fileRecords: files,
    });
  });

  test('It compares selected files', async function (assert) {
    await visit(`/dashboard/choose/${this.fileOld?.id}`);

    assert.strictEqual(currentURL(), `/dashboard/choose/${this.fileOld?.id}`);

    const compareFile = this.fileRecords[1];
    const compareFileSelector = `[data-test-fileCompare-compareList-fileOverview='${compareFile.id}']`;

    await click(
      `${compareFileSelector} [data-test-fileOverview-selectCheckBox]`
    );

    assert
      .dom('[data-test-fileCompare-compareListHeader-compareBtn]')
      .exists()
      .hasText('Compare');

    await click('[data-test-fileCompare-compareListHeader-compareBtn]');

    assert.strictEqual(
      currentURL(),
      `/dashboard/compare/${this.fileOld.id}...${compareFile.id}`
    );
  });

  test('it compares two selected files', async function (assert) {
    await visit(`/dashboard/project/${this.fileOld?.id}/files`);

    const [baseFile, compareFile] = this.fileRecords;

    const baseFileSelector = `[data-test-fileList-fileOverview='${baseFile.id}']`;
    const compareFileSelector = `[data-test-fileList-fileOverview='${compareFile.id}']`;

    // Selects base and compare files
    await click(`${baseFileSelector} [data-test-fileOverview-selectCheckBox]`);

    await click(
      `${compareFileSelector} [data-test-fileOverview-selectCheckBox]`
    );

    await click('[data-test-fileList-projectOverview-header-compareBtn]');

    assert.strictEqual(
      currentURL(),
      `/dashboard/compare/${baseFile?.id}...${compareFile?.id}`
    );
  });

  test('it redirects to settings page if button is clicked', async function (assert) {
    const notify = this.owner.lookup('service:notifications');

    notify.setDefaultClearDuration(0);

    await visit(`/dashboard/project/${this.fileOld?.id}/files`);

    this.server.create('profile', { id: '1' });

    this.server.get('/profiles/:id/proxy_settings', (_, req) => {
      return {
        id: req.params.id,
        host: '',
        port: '',
        enabled: false,
      };
    });

    this.server.get(
      '/organizations/:id/projects/:projectID/collaborators',
      (schema) => {
        const results = schema.projectCollaborators.all().models;
        return { count: results.length, next: null, previous: null, results };
      }
    );

    this.server.get(
      '/organizations/:id/projects/:projectID/teams',
      (schema) => {
        const results = schema.projectTeams.all().models;
        return { count: results.length, next: null, previous: null, results };
      }
    );

    this.server.get('/profiles/:id/device_preference', (schema, req) => {
      return schema.devicePreferences.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/profiles/:id/api_scan_options', (_, req) => {
      return { ds_api_capture_filters: [], id: req.params.id };
    });

    this.server.get('/organizations/:id/jira_projects', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.server.get('/projects/:id/github', () => {
      return {};
    });

    this.server.get('/organizations/:id/github_repos', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-settingsBtn]')
      .exists();

    await click('[data-test-fileCompareHeader-projectOverview-settingsBtn]');

    assert.strictEqual(
      currentURL(),
      `/dashboard/project/${this.fileOld?.id}/settings`
    );
  });

  test('it redirects to all uploads page if user navigates to compare page from all uploads route', async function (assert) {
    await visit(`/dashboard/project/${this.fileOld?.id}/files`);

    const [baseFile, compareFile] = this.fileRecords;

    const baseFileSelector = `[data-test-fileList-fileOverview='${baseFile.id}']`;
    const compareFileSelector = `[data-test-fileList-fileOverview='${compareFile.id}']`;

    // Selects base and compare files
    await click(`${baseFileSelector} [data-test-fileOverview-selectCheckBox]`);

    await click(
      `${compareFileSelector} [data-test-fileOverview-selectCheckBox]`
    );

    await click('[data-test-fileList-projectOverview-header-compareBtn]');

    assert.strictEqual(
      currentURL(),
      `/dashboard/compare/${baseFile?.id}...${compareFile?.id}`
    );

    assert.dom('[data-test-fileCompare-header-compareFileEditIcon]').exists();

    await click('[data-test-fileCompare-header-compareFileEditIcon]');

    assert.strictEqual(
      currentURL(),
      `/dashboard/project/${baseFile?.id}/files`
    );
  });

  test('it redirects to compare list page if compare file edit icon is clicked and user navigates from compare list page', async function (assert) {
    const [baseFile, compareFile] = this.fileRecords;

    await visit(`/dashboard/compare/${baseFile?.id}...${compareFile?.id}`);

    assert.dom('[data-test-fileCompare-header-compareFileEditIcon]').exists();

    await click('[data-test-fileCompare-header-compareFileEditIcon]');

    assert.strictEqual(currentURL(), `/dashboard/choose/${baseFile?.id}`);
  });
});
