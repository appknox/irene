import { module, test } from 'qunit';
import { currentURL, click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
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
    const { previous_file } = setupFileModelEndpoints(this.server);

    const project = this.server.create('project');
    const profile = this.server.create('profile');

    // File Models
    const files = this.server.createList('file', 3, {
      project: project.id,
      profile: profile.id,
    });

    previous_file.update({
      project: project.id,
      profile: profile.id,
    });

    this.server.get('/organizations/:id', (schema, req) =>
      schema.organizationMes.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/v3/projects/:id/files', (schema, req) => {
      const files = schema.files.where({ project: req.params.id }).models;

      return {
        count: files.length,
        next: null,
        previous: null,
        results: files,
      };
    });

    this.server.get('/v3/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v3/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
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
      .hasText(t('compare'));

    await click('[data-test-fileCompare-compareListHeader-compareBtn]');

    assert.strictEqual(
      currentURL(),
      `/dashboard/compare/${this.fileOld.id}...${compareFile.id}`
    );
  });

  test('it compares two selected files', async function (assert) {
    await visit(`/dashboard/project/${this.project?.id}/files`);

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

    await visit(`/dashboard/project/${this.project?.id}/files`);

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
      `/dashboard/project/${this.project?.id}/settings`
    );
  });

  test('it redirects to all uploads page if user navigates to compare page from all uploads route', async function (assert) {
    await visit(`/dashboard/project/${this.project.id}/files`);

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
      `/dashboard/project/${this.project.id}/files`
    );
  });

  test('it redirects to compare list page if compare file edit icon is clicked and user navigates from compare list page', async function (assert) {
    const [baseFile, compareFile] = this.fileRecords;

    await visit(`/dashboard/compare/${baseFile?.id}...${compareFile?.id}`);

    assert.dom('[data-test-fileCompare-header-compareFileEditIcon]').exists();

    await click('[data-test-fileCompare-header-compareFileEditIcon]');

    assert.strictEqual(currentURL(), `/dashboard/choose/${baseFile?.id}`);
  });

  test.each(
    'it compares two files of different projects',
    [
      (file1Id, file2Id) => `/dashboard/compare/${file1Id}...${file2Id}`,

      (file1Id, file2Id) =>
        `/dashboard/compare/${file1Id}...${file2Id}/new-issues`,

      (file1Id, file2Id) =>
        `/dashboard/compare/${file1Id}...${file2Id}/untested-cases`,

      (file1Id, file2Id) =>
        `/dashboard/compare/${file1Id}...${file2Id}/resolved-test-cases`,
    ],
    async function (assert, routeFn) {
      const project = this.server.create('project', {
        id: '10000',
      });

      const non_project_file = this.server.create('file', {
        project: project.id,
      });

      const [baseFile] = this.fileRecords;
      this.project.update({ show_unknown_analysis: true });

      // Since route models use peekRecord, we need to push the records to the store
      const store = this.owner.lookup('service:store');
      store.push(store.normalize('project', this.project.toJSON()));

      // Visit the route
      await visit(routeFn(baseFile?.id, non_project_file?.id));

      assert.strictEqual(
        currentURL(),
        routeFn(baseFile?.id, non_project_file?.id)
      );

      assert.dom('[data-test-fileCompare-invalid-compare]').exists();
      assert.dom('[data-test-fileCompare-invalid-compare-image]').exists();

      assert
        .dom('[data-test-fileCompare-invalid-compare-title]')
        .hasText(t('fileCompare.invalidCompareWarning'));

      assert
        .dom('[data-test-fileCompare-invalid-compare-subtext]')
        .hasText(t('fileCompare.differentProjectsWarningSubText'));

      assert
        .dom('[data-test-fileCompare-header-showFilesOverview-icon]')
        .isDisabled();

      assert.dom('[data-test-fileCompare-tabs-container]').doesNotExist();
    }
  );

  test.each(
    'it shows invalid compare component in compare page if files are the same',
    [
      (file1Id, file2Id) => `/dashboard/compare/${file1Id}...${file2Id}`,

      (file1Id, file2Id) =>
        `/dashboard/compare/${file1Id}...${file2Id}/new-issues`,

      (file1Id, file2Id) =>
        `/dashboard/compare/${file1Id}...${file2Id}/untested-cases`,

      (file1Id, file2Id) =>
        `/dashboard/compare/${file1Id}...${file2Id}/resolved-test-cases`,
    ],
    async function (assert, routeFn) {
      const [baseFile] = this.fileRecords;
      const compareFile = baseFile;
      this.project.update({ show_unknown_analysis: true });

      // Since route models use peekRecord, we need to push the records to the store
      const store = this.owner.lookup('service:store');
      store.push(store.normalize('project', this.project.toJSON()));

      // Visit the route
      await visit(routeFn(baseFile?.id, compareFile?.id));

      assert.strictEqual(currentURL(), routeFn(baseFile?.id, compareFile?.id));

      assert.dom('[data-test-fileCompare-invalid-compare]').exists();
      assert.dom('[data-test-fileCompare-invalid-compare-image]').exists();

      assert
        .dom('[data-test-fileCompare-invalid-compare-title]')
        .hasText(t('fileCompare.invalidCompareWarning'));

      assert
        .dom('[data-test-fileCompare-invalid-compare-subtext]')
        .hasText(t('fileCompare.sameFilesWarningSubText'));

      assert
        .dom('[data-test-fileCompare-header-showFilesOverview-icon]')
        .isDisabled();

      assert.dom('[data-test-fileCompare-tabs-container]').doesNotExist();
    }
  );

  test.each(
    'it shows invalid compare component in vulnerability details page if files are of different projects or are the same file',
    [true, false],
    async function (assert, isSameFile) {
      const project = this.server.create('project', { id: '10000' });
      const [baseFile] = this.fileRecords;

      const non_project_file = this.server.create('file', {
        project: project.id,
      });

      const compareFile = isSameFile ? baseFile : non_project_file;

      this.server.create('vulnerability', {
        id: '3',
      });

      await visit(
        `/dashboard/file-vul-compare/${baseFile?.id}...${compareFile?.id}/3`
      );

      assert.dom('[data-test-fileCompare-invalid-compare]').exists();
      assert.dom('[data-test-fileCompare-invalid-compare-image]').exists();

      assert
        .dom('[data-test-fileCompare-invalid-compare-title]')
        .hasText(t('fileCompare.invalidCompareWarning'));

      assert
        .dom('[data-test-fileCompare-invalid-compare-subtext]')
        .hasText(
          isSameFile
            ? t('fileCompare.sameFilesWarningSubText')
            : t('fileCompare.differentProjectsWarningSubText')
        );

      assert
        .dom('[data-test-fileCompare-expandFilesOverview-btn]')
        .isDisabled();

      assert
        .dom('[data-test-fileCompare-vulnerabilityDetails-file1ID]')
        .hasText(baseFile?.id);

      assert
        .dom('[data-test-fileCompare-vulnerabilityDetails-file2ID]')
        .hasText(compareFile?.id);

      assert
        .dom('[data-test-fileCompare-vulnerabilityDetails-root]')
        .doesNotExist();
    }
  );
});
